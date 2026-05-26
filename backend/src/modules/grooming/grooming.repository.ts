import type { QueryResultRow } from "pg";
import { query } from "../../db/query.js";
import type { GroomingServiceDto, GroomingServicePriceRuleDto } from "./grooming.types.js";

type GroomingServiceRow = QueryResultRow & {
  service_id: string;
  service_name: string;
  description: string | null;
  estimated_duration_minutes: number | null;
  base_price: string | number;
  price_rule_id: string | null;
  pricing_condition: string | null;
  price_amount: string | number | null;
  effective_from: string | null;
};

function getPricingConditionLabel(condition: string): string {
  const labels: Record<string, string> = {
    UNDER_5KG: "Dưới 5kg",
    FROM_5KG: "Từ 5kg trở lên"
  };

  return labels[condition] ?? condition;
}

function formatMoney(value: number): string {
  return new Intl.NumberFormat("vi-VN").format(value);
}

function formatPriceRange(priceMin: number, priceMax: number): string {
  if (priceMin === priceMax) {
    return `${formatMoney(priceMin)} VNĐ`;
  }

  return `${formatMoney(priceMin)} - ${formatMoney(priceMax)} VNĐ`;
}

function formatDuration(minutes: number | null): string {
  if (minutes === null) return "Chưa cập nhật";
  if (minutes < 60) return `${minutes} phút`;
  if (minutes % 60 === 0) return `${minutes / 60} giờ`;

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return `${hours} giờ ${remainingMinutes} phút`;
}

function mapGroomingServices(rows: GroomingServiceRow[]): GroomingServiceDto[] {
  const services = new Map<string, GroomingServiceDto>();

  for (const row of rows) {
    const basePrice = Number(row.base_price);
    const existing = services.get(row.service_id);
    const service =
      existing ??
      {
        serviceId: row.service_id,
        serviceName: row.service_name,
        description: row.description,
        estimatedDurationMinutes: row.estimated_duration_minutes,
        durationText: formatDuration(row.estimated_duration_minutes),
        basePrice,
        priceMin: basePrice,
        priceMax: basePrice,
        priceText: formatPriceRange(basePrice, basePrice),
        priceRules: []
      };

    if (row.price_rule_id && row.pricing_condition && row.price_amount !== null && row.effective_from) {
      const priceRule: GroomingServicePriceRuleDto = {
        priceRuleId: row.price_rule_id,
        pricingCondition: row.pricing_condition,
        pricingConditionLabel: getPricingConditionLabel(row.pricing_condition),
        priceAmount: Number(row.price_amount),
        effectiveFrom: row.effective_from
      };

      service.priceRules.push(priceRule);
    }

    services.set(row.service_id, service);
  }

  return [...services.values()].map((service) => {
    const priceAmounts = service.priceRules.map((rule) => rule.priceAmount);
    const prices = priceAmounts.length > 0 ? priceAmounts : [service.basePrice];
    const priceMin = Math.min(...prices);
    const priceMax = Math.max(...prices);

    return {
      ...service,
      priceMin,
      priceMax,
      priceText: formatPriceRange(priceMin, priceMax)
    };
  });
}

export async function findActiveGroomingServices(): Promise<GroomingServiceDto[]> {
  const result = await query<GroomingServiceRow>(
    `with latest_price_rules as (
       select distinct on (spr.service_id, spr.pricing_condition)
         spr.price_rule_id,
         spr.service_id,
         spr.pricing_condition,
         spr.price_amount,
         spr.effective_from
       from pet_center.service_price_rules spr
       where spr.price_status = 'active'
         and spr.effective_from <= current_date
       order by spr.service_id, spr.pricing_condition, spr.effective_from desc
     )
     select
       s.service_id,
       s.service_name,
       s.description,
       s.estimated_duration_minutes,
       s.base_price,
       lpr.price_rule_id,
       lpr.pricing_condition,
       lpr.price_amount,
       lpr.effective_from::text as effective_from
     from pet_center.services s
     left join latest_price_rules lpr on lpr.service_id = s.service_id
     where s.service_category = 'grooming'
       and s.service_status = 'active'
     order by
       s.service_id asc,
       case lpr.pricing_condition
         when 'UNDER_5KG' then 1
         when 'FROM_5KG' then 2
         else 3
       end asc,
       lpr.pricing_condition asc`
  );

  return mapGroomingServices(result.rows);
}
