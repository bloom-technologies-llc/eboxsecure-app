import { Container } from "../ui/container";

export function AboutMission() {
  return (
    <div className="bg-background py-24 sm:py-32">
      <Container>
        <div className="mx-auto max-w-2xl lg:mx-0">
          <h2 className="text-base font-semibold leading-7 text-primary">
            Our Mission
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Secure, Convenient Package Delivery
          </p>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            At EboxSecure, our mission is to revolutionize the last-mile
            delivery experience by providing secure, convenient warehouse
            locations for package delivery. We're committed to solving the
            challenges of modern e-commerce logistics with innovative solutions
            that benefit both consumers and businesses.
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 lg:mx-0 lg:mt-20 lg:max-w-none lg:grid-cols-2">
          <div className="flex flex-col gap-y-6 rounded-2xl bg-muted/50 p-8">
            <h3 className="text-xl font-semibold leading-8 tracking-tight text-foreground">
              Our Story
            </h3>
            <p className="text-base leading-7 text-muted-foreground">
              EboxSecure was founded in Carmel, Indiana with a simple idea: what
              if we could make package delivery more secure and convenient?
              After witnessing the growing problems of porch piracy and missed
              deliveries, our founders set out to create a solution that would
              transform the last-mile delivery experience.
            </p>
            <p className="text-base leading-7 text-muted-foreground">
              Starting with a single warehouse location, we've built a system
              that allows carriers to deliver packages as B2B deliveries to our
              secure facilities, where customers can pick them up at their
              convenience. Our innovative virtual address system and Shopify
              integration have made this process seamless for both consumers and
              retailers.
            </p>
          </div>
          <div className="flex flex-col gap-y-6 rounded-2xl bg-muted/50 p-8">
            <h3 className="text-xl font-semibold leading-8 tracking-tight text-foreground">
              Our Values
            </h3>
            <ul className="space-y-4 text-base leading-7 text-muted-foreground">
              <li className="flex gap-x-3">
                <span className="font-semibold text-foreground">Security:</span>{" "}
                We prioritize the safety and security of your packages above all
                else.
              </li>
              <li className="flex gap-x-3">
                <span className="font-semibold text-foreground">
                  Convenience:
                </span>{" "}
                We design our services to make your life easier, not more
                complicated.
              </li>
              <li className="flex gap-x-3">
                <span className="font-semibold text-foreground">
                  Innovation:
                </span>{" "}
                We continuously seek new ways to improve the delivery
                experience.
              </li>
              <li className="flex gap-x-3">
                <span className="font-semibold text-foreground">
                  Reliability:
                </span>{" "}
                We build systems you can count on, day in and day out.
              </li>
              <li className="flex gap-x-3">
                <span className="font-semibold text-foreground">
                  Scalability:
                </span>{" "}
                We design our solutions to grow with your needs.
              </li>
            </ul>
          </div>
        </div>
      </Container>
    </div>
  );
}
