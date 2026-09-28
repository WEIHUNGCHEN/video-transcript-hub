-- Link the credit tiers to their Stripe sandbox prices.
-- Kept as a migration so the mapping is reproducible from git, per
-- supabase-best-practice Rule 1.

update public.credit_products
   set stripe_price_id = 'price_1UKZzJHXgLfloFu4QgoXohpC'
 where name = '10 Credits';

update public.credit_products
   set stripe_price_id = 'price_1UKZzQHXgLfloFu46eOR5MNi'
 where name = '45 Credits';

update public.credit_products
   set stripe_price_id = 'price_1UKZzYHXgLfloFu4NWm3zJVA'
 where name = '90 Credits';
