import Link from 'next/link';
import { notFound } from 'next/navigation';
import prisma from '@/db/prisma';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default async function SpeciesDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const species = await prisma.fishSpecies.findUnique({
    where: { id },
  });

  if (!species) notFound();

  return (
    <div className="w-full space-y-8 pb-16">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link href="/species" className="inline-flex items-center gap-1 text-xs text-n-muted hover:text-n-text transition-colors">
          ← Назад до списку видів
        </Link>
      </div>

      {/* Page header */}
      <div className="border-b border-n-border pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="blue">Профіль виду</Badge>
            {!species.userId && <Badge variant="gray">За замовчуванням</Badge>}
          </div>
          <h1 className="text-3xl font-bold text-n-text mb-1">{species.name}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
        <Card>
          <CardHeader>
            <span className="text-base">📊</span>
            <CardTitle>Статистика (Незабаром)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-n-muted leading-relaxed">
              Детальна статистика, така як найбільший улов, загальна вага та найпродуктивніші наживки для виду {species.name}, буде доступна тут у майбутньому оновленні.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <span className="text-base">📅</span>
            <CardTitle>Останні улови (Незабаром)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-n-muted leading-relaxed">
              Галерея ваших останніх уловів виду {species.name} разом із точними погодними умовами та локаціями буде відображена тут.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
