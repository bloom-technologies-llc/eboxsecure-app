"use client";

import { useRouter } from "next/navigation";
import { Bell, Clock, MapPin, Package, User } from "lucide-react";

import { Button } from "@ebox/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@ebox/ui/card";

import { api } from "../../../trpc/react";

export function EmployeeHome() {
  const router = useRouter();

  // Fetch recent orders for the employee's location
  const { data: recentOrders, isLoading: isLoadingOrders } =
    api.order.getAllOrdersForEmployee.useQuery();

  // Get quick stats for employee dashboard
  const pendingDeliveries =
    recentOrders?.filter((order) => order.deliveredDate === null).length || 0;
  const pendingPickups =
    recentOrders?.filter(
      (order) => order.deliveredDate !== null && order.pickedUpAt === null,
    ).length || 0;
  const processedToday =
    recentOrders?.filter((order) => {
      const today = new Date();
      const processedDate = order.processedAt
        ? new Date(order.processedAt)
        : null;
      return (
        processedDate && processedDate.toDateString() === today.toDateString()
      );
    }).length || 0;

  const handleViewOrders = () => {
    router.push("/orders");
  };

  const handleViewCustomers = () => {
    router.push("/customers");
  };

  return (
    <div className="mt-16 flex-1 space-y-8 p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
          Employee Dashboard
        </h2>
        <div className="text-sm text-muted-foreground">
          Welcome to your workspace
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Deliveries
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingDeliveries}</div>
            <p className="text-xs text-muted-foreground">
              Packages to be delivered
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ready for Pickup
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingPickups}</div>
            <p className="text-xs text-muted-foreground">
              Packages awaiting pickup
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Processed Today
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{processedToday}</div>
            <p className="text-xs text-muted-foreground">
              Orders processed today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {recentOrders?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              All orders in system
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Order Management
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              View and manage all orders and packages
            </p>
            <Button
              className="mt-2 w-full"
              variant="outline"
              onClick={handleViewOrders}
            >
              View Orders
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Customer Information
            </CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Access customer details and history
            </p>
            <Button
              className="mt-2 w-full"
              variant="outline"
              onClick={handleViewCustomers}
            >
              View Customers
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notifications</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Important updates and alerts
            </p>
            <Button className="mt-2 w-full" variant="outline" disabled>
              View All
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Today's Priority Tasks */}
      <Card>
        <CardHeader>
          <CardTitle>Priority Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pendingDeliveries > 0 && (
              <div className="flex items-center justify-between border-b pb-2">
                <div>
                  <p className="font-medium">Process incoming deliveries</p>
                  <p className="text-sm text-muted-foreground">
                    {pendingDeliveries} packages need to be marked as delivered
                  </p>
                </div>
                <Button size="sm" onClick={handleViewOrders}>
                  View
                </Button>
              </div>
            )}
            {pendingPickups > 0 && (
              <div className="flex items-center justify-between border-b pb-2">
                <div>
                  <p className="font-medium">Facilitate customer pickups</p>
                  <p className="text-sm text-muted-foreground">
                    {pendingPickups} packages ready for customer pickup
                  </p>
                </div>
                <Button size="sm" onClick={handleViewOrders}>
                  View
                </Button>
              </div>
            )}
            {pendingDeliveries === 0 && pendingPickups === 0 && (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <p className="font-medium text-muted-foreground">
                    All caught up!
                  </p>
                  <p className="text-sm text-muted-foreground">
                    No pending tasks at the moment
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {isLoadingOrders ? (
              <div className="text-sm text-muted-foreground">
                Loading recent activity...
              </div>
            ) : recentOrders && recentOrders.length > 0 ? (
              recentOrders.slice(0, 5).map((order) => {
                const isDelivered = order.deliveredDate !== null;
                const isPickedUp = order.pickedUpAt !== null;

                let status = "processing";
                let statusColor = "bg-blue-500";
                let activity = "Order created";

                if (isPickedUp) {
                  status = "completed";
                  statusColor = "bg-green-500";
                  activity = "Package picked up";
                } else if (isDelivered) {
                  status = "ready";
                  statusColor = "bg-yellow-500";
                  activity = "Package delivered, awaiting pickup";
                }

                return (
                  <div key={order.id} className="flex items-center gap-4">
                    <div className={`h-2 w-2 rounded-full ${statusColor}`} />
                    <div className="flex-1">
                      <p className="text-sm">
                        {activity} - Order #{order.id}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {isPickedUp
                          ? new Date(order.pickedUpAt!).toLocaleString()
                          : isDelivered
                            ? new Date(order.deliveredDate!).toLocaleString()
                            : new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-sm text-muted-foreground">
                No recent activity
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
