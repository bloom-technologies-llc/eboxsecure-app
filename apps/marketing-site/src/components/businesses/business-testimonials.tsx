import { Container } from "../ui/container";

const testimonials = [
  {
    content:
      "EboxSecure has transformed our delivery process. We've seen a 98% reduction in failed deliveries and a significant decrease in customer service inquiries about missing packages.",
    author: "Sarah Johnson",
    role: "Operations Director",
    company: "Urban Outfitters",
  },
  {
    content:
      "The integration was seamless, and our customers love having the option for secure delivery. It's been a game-changer for our high-value electronics shipments.",
    author: "Michael Chen",
    role: "E-commerce Manager",
    company: "TechWorld Electronics",
  },
  {
    content:
      "As a small boutique, we struggled with package theft issues. EboxSecure provided an affordable solution that has improved our customer satisfaction and reduced our shipping costs.",
    author: "Emma Rodriguez",
    role: "Owner",
    company: "Bella Boutique",
  },
];

export function BusinessTestimonials() {
  return (
    <div className="bg-muted/30 py-24 sm:py-32">
      <Container>
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-primary">
            Success Stories
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            What Our Business Partners Say
          </p>
        </div>
        <div className="mx-auto mt-16 flow-root max-w-2xl sm:mt-20 lg:mx-0 lg:max-w-none">
          <div className="-mt-8 sm:-mx-4 sm:columns-2 sm:text-[0] lg:columns-3">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.author}
                className="pt-8 sm:inline-block sm:w-full sm:px-4"
              >
                <figure className="rounded-2xl bg-background p-8 text-sm leading-6">
                  <blockquote className="text-foreground">
                    <p>{`"${testimonial.content}"`}</p>
                  </blockquote>
                  <figcaption className="mt-6 flex items-center gap-x-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <span className="font-semibold text-primary">
                        {testimonial.author.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">
                        {testimonial.author}
                      </div>
                      <div className="text-muted-foreground">{`${testimonial.role}, ${testimonial.company}`}</div>
                    </div>
                  </figcaption>
                </figure>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}
