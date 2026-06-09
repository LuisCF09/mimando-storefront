
-- 1) products: new columns
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS estoque integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_personalizavel boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_bestseller boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_novidade boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_promocao boolean NOT NULL DEFAULT false;

-- 2) orders: cupom + desconto
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS cupom_codigo text,
  ADD COLUMN IF NOT EXISTS desconto numeric(10,2) NOT NULL DEFAULT 0;

-- 3) site_settings (singleton-like by key)
CREATE TABLE IF NOT EXISTS public.site_settings (
  key text PRIMARY KEY,
  titulo text NOT NULL DEFAULT '',
  subtitulo text NOT NULL DEFAULT '',
  botao_texto text NOT NULL DEFAULT '',
  botao_link text NOT NULL DEFAULT '',
  imagem_url text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view site_settings" ON public.site_settings;
CREATE POLICY "Anyone can view site_settings" ON public.site_settings
  FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Admin manages site_settings" ON public.site_settings;
CREATE POLICY "Admin manages site_settings" ON public.site_settings
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP TRIGGER IF EXISTS site_settings_set_updated_at ON public.site_settings;
CREATE TRIGGER site_settings_set_updated_at BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.site_settings (key, titulo, subtitulo, botao_texto, botao_link)
VALUES ('home_banner',
  'Mimos especiais para presentear quem você ama',
  'Canecas, garrafas, camisas, laços, papelaria e presentes criativos escolhidos com carinho.',
  'Ver produtos', '/produtos')
ON CONFLICT (key) DO NOTHING;

-- 4) coupons
CREATE TABLE IF NOT EXISTS public.coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text NOT NULL UNIQUE,
  tipo text NOT NULL CHECK (tipo IN ('percent','fixed')),
  valor numeric(10,2) NOT NULL CHECK (valor >= 0),
  validade date,
  ativo boolean NOT NULL DEFAULT true,
  min_subtotal numeric(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.coupons TO authenticated;
GRANT ALL ON public.coupons TO service_role;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin manages coupons" ON public.coupons;
CREATE POLICY "Admin manages coupons" ON public.coupons
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP TRIGGER IF EXISTS coupons_set_updated_at ON public.coupons;
CREATE TRIGGER coupons_set_updated_at BEFORE UPDATE ON public.coupons
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 5) occasions
CREATE TABLE IF NOT EXISTS public.occasions (
  slug text PRIMARY KEY,
  nome text NOT NULL,
  ordem integer NOT NULL DEFAULT 0
);
GRANT SELECT ON public.occasions TO anon, authenticated;
GRANT ALL ON public.occasions TO service_role;
ALTER TABLE public.occasions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view occasions" ON public.occasions;
CREATE POLICY "Anyone can view occasions" ON public.occasions
  FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Admin manages occasions" ON public.occasions;
CREATE POLICY "Admin manages occasions" ON public.occasions
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.occasions (slug, nome, ordem) VALUES
  ('aniversario','Aniversário',1),
  ('dia-dos-namorados','Dia dos Namorados',2),
  ('amiga-especial','Amiga especial',3),
  ('professores','Professores',4),
  ('mae','Mãe',5),
  ('pai','Pai',6),
  ('natal','Natal',7),
  ('volta-as-aulas','Volta às aulas',8)
ON CONFLICT (slug) DO NOTHING;

-- 6) product_occasions (junction)
CREATE TABLE IF NOT EXISTS public.product_occasions (
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  occasion_slug text NOT NULL REFERENCES public.occasions(slug) ON DELETE CASCADE,
  PRIMARY KEY (product_id, occasion_slug)
);
GRANT SELECT ON public.product_occasions TO anon, authenticated;
GRANT ALL ON public.product_occasions TO service_role;
ALTER TABLE public.product_occasions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view product_occasions" ON public.product_occasions;
CREATE POLICY "Anyone can view product_occasions" ON public.product_occasions
  FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Admin manages product_occasions" ON public.product_occasions;
CREATE POLICY "Admin manages product_occasions" ON public.product_occasions
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
