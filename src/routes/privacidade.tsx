import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: "Política de Privacidade — Mimando Papelaria" },
      {
        name: "description",
        content:
          "Saiba como a Mimando Papelaria coleta, usa e protege seus dados pessoais conforme a LGPD.",
      },
      { property: "og:title", content: "Política de Privacidade — Mimando Papelaria" },
      {
        property: "og:description",
        content: "Como tratamos seus dados na Mimando Papelaria.",
      },
    ],
  }),
  component: PrivacidadePage,
});

function PrivacidadePage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold">Política de Privacidade</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Última atualização: {new Date().toLocaleDateString("pt-BR")}
      </p>

      <div className="prose prose-sm mt-8 max-w-none space-y-6 text-foreground">
        <section>
          <h2 className="text-xl font-semibold">1. Quais dados coletamos</h2>
          <p>
            Na Mimando Papelaria Fofa e Presentes Criativos, coletamos apenas os dados
            estritamente necessários para o seu atendimento: <strong>nome</strong>,{" "}
            <strong>e-mail</strong> e <strong>CEP</strong> (além de endereço completo no
            momento da compra, para entrega).
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">2. Como usamos seus dados</h2>
          <p>
            Usamos suas informações exclusivamente para: criar e manter sua conta, processar
            seus pedidos, entrar em contato sobre suas compras e enviar seus presentes.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">3. Compartilhamento</h2>
          <p>
            <strong>Não compartilhamos seus dados</strong> com terceiros sem sua autorização,
            exceto quando estritamente necessário para entrega (transportadoras) ou processamento
            de pagamento (Mercado Pago).
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">4. Seus direitos (LGPD)</h2>
          <p>
            Conforme a Lei Geral de Proteção de Dados (LGPD), você pode solicitar a qualquer
            momento o acesso, correção ou <strong>exclusão dos seus dados</strong> entrando em
            contato conosco pelo WhatsApp{" "}
            <a
              href="https://wa.me/5511984399180"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              +55 11 98439-9180
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">5. Segurança</h2>
          <p>
            Adotamos medidas técnicas para proteger seus dados contra acesso não autorizado,
            incluindo autenticação segura e controle de acesso ao banco de dados.
          </p>
        </section>

        <p className="text-sm text-muted-foreground">
          Veja também os nossos{" "}
          <Link to="/termos" className="text-primary underline">
            Termos de Uso
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
