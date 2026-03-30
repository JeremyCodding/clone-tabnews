import useSWR from "swr";

async function fetchStatus(key) {
  const response = await fetch(key);
  const responseBody = await response.json();

  return responseBody;
}

export default function StatusPage() {
  return (
    <div>
      <h1>Status</h1>
      <DatabaseStatus />
    </div>
  );
}

function DatabaseStatus() {
  const { isLoading, data } = useSWR("/api/v1/status", fetchStatus, {
    refreshInterval: 2000,
  });

  const { max_connections, opened_connections, version } =
    data.dependencies.database;

  let updatedAtText = "Carregando...";

  if (!isLoading) {
    updatedAtText = new Date(data.updated_at).toLocaleString("pt-BR");
  }
  console.log(max_connections, opened_connections, version);
  return (
    <div>
      <div>Última atualização: {updatedAtText}</div>
      <section>
        <h1>{data.dependencies && <span>Database</span>}</h1>
        <b>{data.dependencies && <span>API Funcionando</span>}</b>
        <p>Número máximo de conexões: {max_connections}</p>
        <p>Conexões abertas: {opened_connections}</p>
        <p>Versão do Postgres: {version}</p>
      </section>
    </div>
  );
}
