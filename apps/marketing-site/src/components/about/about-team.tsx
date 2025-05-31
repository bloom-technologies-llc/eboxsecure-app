import { Container } from "../ui/container";

const team = [
  {
    name: "Jane Smith",
    role: "Co-Founder / CEO",
    imageUrl: "/placeholder-team-1.jpg",
    bio: "Jane brings over 15 years of experience in logistics and supply chain management. Prior to founding EboxSecure, she led operations at a major e-commerce fulfillment center.",
  },
  {
    name: "Michael Johnson",
    role: "Co-Founder / CTO",
    imageUrl: "/placeholder-team-2.jpg",
    bio: "Michael is a technology veteran with expertise in building scalable logistics platforms. He previously developed warehouse management systems for Fortune 500 retailers.",
  },
  {
    name: "Sarah Williams",
    role: "VP of Operations",
    imageUrl: "/placeholder-team-3.jpg",
    bio: "Sarah oversees our warehouse network and ensures smooth operations across all locations. Her background in industrial engineering helps optimize our delivery processes.",
  },
  {
    name: "David Chen",
    role: "Head of Business Development",
    imageUrl: "/placeholder-team-4.jpg",
    bio: "David leads our partnerships with retailers and e-commerce platforms. He has extensive experience in building B2B relationships in the logistics sector.",
  },
];

export function AboutTeam() {
  return (
    <div className="bg-muted/50 py-24 sm:py-32">
      <Container>
        <div className="mx-auto max-w-2xl lg:mx-0">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Our Team
          </h2>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Meet the passionate team behind EboxSecure. We're a diverse group of
            logistics experts, technology innovators, and customer experience
            specialists working together to transform package delivery.
          </p>
        </div>
        <ul
          role="list"
          className="mx-auto mt-20 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-4"
        >
          {team.map((person) => (
            <li key={person.name}>
              <div className="relative h-56 w-full overflow-hidden rounded-lg bg-muted">
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  Team Member Photo
                </div>
              </div>
              <h3 className="mt-6 text-lg font-semibold leading-8 tracking-tight text-foreground">
                {person.name}
              </h3>
              <p className="text-base leading-7 text-primary">{person.role}</p>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                {person.bio}
              </p>
            </li>
          ))}
        </ul>
      </Container>
    </div>
  );
}
