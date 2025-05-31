import { Container } from "@ebox/ui/container";

interface LegalHeroProps {
  title: string;
  description: string;
}

export function LegalHero({ title, description }: LegalHeroProps) {
  return (
    <div className="bg-gray-50 py-16">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 text-lg text-gray-600">{description}</p>
        </div>
      </Container>
    </div>
  );
}
