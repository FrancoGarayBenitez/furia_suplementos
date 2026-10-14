ALTER TABLE public.store_settings ADD COLUMN IF NOT EXISTS cart_welcome_message text;

UPDATE public.store_settings
SET cart_welcome_message = '¡Hola! Te paso mi pedido.'
WHERE cart_welcome_message IS NULL;
