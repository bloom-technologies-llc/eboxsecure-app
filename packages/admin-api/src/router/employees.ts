import { clerkClient } from "@clerk/nextjs/server";
import { EmployeeRole, LocationType, UserType } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedAdminProcedure,
  protectedCorporateProcedure,
} from "../trpc";

// Helper function for employee RBAC
const getEmployeeAccess = async (userId: string, db: any) => {
  const userType = await db.user.findUnique({
    where: { id: userId },
    select: { userType: true },
  });

  if (userType?.userType === UserType.CORPORATE) {
    return { hasAccess: true, locationIds: "all" };
  } else if (userType?.userType === UserType.EMPLOYEE) {
    const employee = await db.employeeAccount.findUnique({
      where: { id: userId },
      select: { locationId: true, employeeRole: true },
    });

    if (!employee) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Employee account not found",
      });
    }

    // Only managers can access employee features
    if (employee.employeeRole !== EmployeeRole.MANAGER) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Only managers can access employee management",
      });
    }

    return { hasAccess: true, locationIds: [employee.locationId] };
  }

  throw new TRPCError({ code: "UNAUTHORIZED" });
};

// Helper function to verify employee access
const verifyEmployeeAccess = async (
  userId: string,
  employeeId: string,
  db: any,
) => {
  const access = await getEmployeeAccess(userId, db);

  if (access.locationIds === "all") {
    return true; // Corporate has access to all employees
  }

  // For employee managers, check if target employee is in their location
  const targetEmployee = await db.employeeAccount.findUnique({
    where: { id: employeeId },
    select: { locationId: true },
  });

  if (!targetEmployee) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Employee not found",
    });
  }

  return access.locationIds.includes(targetEmployee.locationId);
};

export const employeesRouter = createTRPCRouter({
  getAllEmployees: protectedAdminProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
        search: z.string().optional(),
        typeFilter: z.array(z.enum(["AGENT", "FRANCHISE"])).optional(),
        roleFilter: z.array(z.enum(["MANAGER", "ASSOCIATE"])).optional(),
        sortBy: z
          .enum(["name", "type", "role", "location", "email", "createdAt"])
          .default("createdAt"),
        sortDirection: z.enum(["asc", "desc"]).default("desc"),
      }),
    )
    .query(async ({ ctx, input }) => {
      const access = await getEmployeeAccess(ctx.session.userId, ctx.db);

      const skip = (input.page - 1) * input.limit;

      // Build where clause based on access
      let whereClause: any = {};

      if (access.locationIds !== "all") {
        whereClause.locationId = { in: access.locationIds };
      }

      // Add type filter
      if (input.typeFilter && input.typeFilter.length > 0) {
        whereClause.location = {
          locationType: { in: input.typeFilter },
        };
      }

      // Add role filter
      if (input.roleFilter && input.roleFilter.length > 0) {
        whereClause.employeeRole = { in: input.roleFilter };
      }

      const [employees, totalCount] = await Promise.all([
        ctx.db.employeeAccount.findMany({
          where: whereClause,
          include: {
            user: {
              select: {
                id: true,
                createdAt: true,
              },
            },
            location: {
              select: {
                id: true,
                name: true,
                address: true,
                locationType: true,
              },
            },
          },
          orderBy:
            input.sortBy === "createdAt"
              ? { user: { createdAt: input.sortDirection } }
              : input.sortBy === "location"
                ? { location: { name: input.sortDirection } }
                : input.sortBy === "role"
                  ? { employeeRole: input.sortDirection }
                  : undefined,
          skip,
          take: input.limit,
        }),
        ctx.db.employeeAccount.count({ where: whereClause }),
      ]);

      // Get Clerk data for all employees
      const clerk = await clerkClient();
      const userIds = employees.map((emp) => emp.id);

      const clerkUsers = await clerk.users.getUserList({
        userId: userIds,
      });

      // Combine data and apply search/sort if needed
      let enrichedEmployees = employees.map((employee) => {
        const clerkUser = clerkUsers.data.find(
          (user) => user.id === employee.id,
        );
        const fullName =
          `${clerkUser?.firstName || ""} ${clerkUser?.lastName || ""}`.trim();

        return {
          id: employee.id,
          fullName,
          firstName: clerkUser?.firstName || "",
          lastName: clerkUser?.lastName || "",
          email: clerkUser?.emailAddresses[0]?.emailAddress || "",
          phone: clerkUser?.phoneNumbers[0]?.phoneNumber || "",
          role: employee.employeeRole,
          location: {
            id: employee.location.id,
            name: employee.location.name,
            address: employee.location.address,
            type: employee.location.locationType,
          },
          createdAt: employee.user.createdAt,
        };
      });

      // Apply search filter
      if (input.search) {
        const searchLower = input.search.toLowerCase();
        enrichedEmployees = enrichedEmployees.filter(
          (emp) =>
            emp.fullName.toLowerCase().includes(searchLower) ||
            emp.email.toLowerCase().includes(searchLower) ||
            emp.phone.toLowerCase().includes(searchLower) ||
            emp.location.name.toLowerCase().includes(searchLower),
        );
      }

      // Apply sorting for Clerk fields
      if (input.sortBy === "name" || input.sortBy === "email") {
        enrichedEmployees.sort((a, b) => {
          const aVal = input.sortBy === "name" ? a.fullName : a.email;
          const bVal = input.sortBy === "name" ? b.fullName : b.email;
          const result = aVal.localeCompare(bVal);
          return input.sortDirection === "asc" ? result : -result;
        });
      }

      const totalPages = Math.ceil(totalCount / input.limit);
      const hasNextPage = input.page < totalPages;

      return {
        employees: enrichedEmployees,
        pagination: {
          page: input.page,
          limit: input.limit,
          totalCount,
          totalPages,
          hasNextPage,
        },
      };
    }),

  getEmployeeDetails: protectedAdminProcedure
    .input(z.object({ employeeId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Verify access
      const hasAccess = await verifyEmployeeAccess(
        ctx.session.userId,
        input.employeeId,
        ctx.db,
      );

      if (!hasAccess) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Access denied to this employee",
        });
      }

      const employee = await ctx.db.employeeAccount.findUnique({
        where: { id: input.employeeId },
        include: {
          user: {
            select: {
              id: true,
              createdAt: true,
            },
          },
          location: {
            select: {
              id: true,
              name: true,
              address: true,
              locationType: true,
            },
          },
        },
      });

      if (!employee) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Employee not found",
        });
      }

      // Get Clerk data
      const clerk = await clerkClient();
      const clerkUser = await clerk.users.getUser(input.employeeId);

      return {
        id: employee.id,
        fullName:
          `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim(),
        firstName: clerkUser.firstName || "",
        lastName: clerkUser.lastName || "",
        email: clerkUser.emailAddresses[0]?.emailAddress || "",
        phone: clerkUser.phoneNumbers[0]?.phoneNumber || "",
        role: employee.employeeRole,
        location: {
          id: employee.location.id,
          name: employee.location.name,
          address: employee.location.address,
          type: employee.location.locationType,
        },
        createdAt: employee.user.createdAt,
      };
    }),

  updateEmployeeRole: protectedCorporateProcedure
    .input(
      z.object({
        employeeId: z.string(),
        role: z.nativeEnum(EmployeeRole),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const employee = await ctx.db.employeeAccount.findUnique({
        where: { id: input.employeeId },
      });

      if (!employee) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Employee not found",
        });
      }

      await ctx.db.employeeAccount.update({
        where: { id: input.employeeId },
        data: { employeeRole: input.role },
      });

      return { success: true };
    }),

  updateEmployeeLocation: protectedCorporateProcedure
    .input(
      z.object({
        employeeId: z.string(),
        locationId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [employee, location] = await Promise.all([
        ctx.db.employeeAccount.findUnique({
          where: { id: input.employeeId },
        }),
        ctx.db.location.findUnique({
          where: { id: input.locationId },
        }),
      ]);

      if (!employee) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Employee not found",
        });
      }

      if (!location) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Location not found",
        });
      }

      await ctx.db.employeeAccount.update({
        where: { id: input.employeeId },
        data: { locationId: input.locationId },
      });

      return { success: true };
    }),

  getEmployeeLocationEmployees: protectedAdminProcedure
    .input(z.object({ employeeId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Verify access to this employee
      const hasAccess = await verifyEmployeeAccess(
        ctx.session.userId,
        input.employeeId,
        ctx.db,
      );

      if (!hasAccess) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Access denied to this employee",
        });
      }

      // Get the employee's location
      const employee = await ctx.db.employeeAccount.findUnique({
        where: { id: input.employeeId },
        select: { locationId: true },
      });

      if (!employee) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Employee not found",
        });
      }

      // Get current user's access level for mentions
      const access = await getEmployeeAccess(ctx.session.userId, ctx.db);

      let mentionableEmployees;

      if (access.locationIds === "all") {
        // Corporate can mention all admin users
        mentionableEmployees = await ctx.db.employeeAccount.findMany({
          select: { id: true },
        });
      } else {
        // Employee managers can only mention employees in their location
        mentionableEmployees = await ctx.db.employeeAccount.findMany({
          where: { locationId: employee.locationId },
          select: { id: true },
        });
      }

      const userIds = mentionableEmployees.map((emp) => emp.id);

      const clerk = await clerkClient();
      const clerkUsers = await clerk.users.getUserList({
        userId: userIds,
      });

      return mentionableEmployees.map((emp) => {
        const clerkUser = clerkUsers.data.find((user) => user.id === emp.id);
        return {
          id: emp.id,
          firstName: clerkUser?.firstName ?? "",
          lastName: clerkUser?.lastName ?? "",
          email: clerkUser?.emailAddresses[0]?.emailAddress ?? "",
        };
      });
    }),

  getAllLocations: protectedCorporateProcedure.query(async ({ ctx }) => {
    // Helper endpoint for location dropdown in employee editing
    return await ctx.db.location.findMany({
      select: {
        id: true,
        name: true,
        address: true,
        locationType: true,
      },
      orderBy: { name: "asc" },
    });
  }),
});
