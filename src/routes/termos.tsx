import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/termos")({
  head: () => ({
    meta: [
      { title: "Termos de Uso — Mimando Papelaria" },
      {
        name: "description",
        content: "Termos e condições de uso do site Mimando Papelaria Fofa e Presentes Criativos.",
      },
      { property: "og:title", content: "Termos de Uso — Mimando Papelaria" },
      {
        property: "og:description",
        content: "Condições de uso do site Mimando Papelaria.",
      },
    ],
  }),
  component: TermosPage,
});

function TermosPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold">Termos de Uso</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Última atualização: {new Date().toLocaleDateString("pt-BR")}
      </p>

      <div className="prose prose-sm mt-8 max-w-none space-y-6 text-foreground">
        <section>
          <h2 className="text-xl font-semibold">1. Sobre a loja</h2>
          <p>
            A Mimando Papelaria Fofa e Presentes Criativos é uma loja virtual operada por
            uma única administradora, dedicada à venda de papelaria e presentes criativos.
            O site não é um marketplace — apenas a administradora cadastra produtos.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">2. Cadastro de clientes</h2>
          <p>
            Para realizar compras, o cliente deve criar uma conta com dados verdadeiros e
            manter a confidencialidade da sua senha. O uso da conta é pessoal e intransferível.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">3. Pedidos e pagamentos</h2>
          <p>
            Os pedidos podem ser concluídos por contato via WhatsApp ou por pagamento online
            no próprio site. Os preços e a disponibilidade dos produtos podem ser alterados
            sem aviso prévio.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">4. Entrega</h2>
          <p>
            A entrega é combinada após a confirmação do pedido, conforme o endereço
            informado no checkout ou ajustado via WhatsApp.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">5. Uso adequado</h2>
          <p>
            O cliente concorda em não utilizar o site para fins ilícitos, não tentar acessar
            áreas restritas e não interferir no funcionamento do sistema.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">6. Privacidade</h2>
          <p>
            O tratamento dos seus dados pessoais segue a nossa{" "}
            <Link to="/privacidade" className="text-primary underline">
              Política de Privacidade
            </Link>
            , em conformidade com a LGPD.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">7. Contato</h2>
          <p>
            Dúvidas sobre estes Termos? Fale com a gente pelo WhatsApp{" "}
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
      </div>
    </div>
  );
}
