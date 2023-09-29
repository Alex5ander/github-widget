export const getServerSideProps = async () => {
  const data = await fetch(process.env.URL + '/api/visit');
  const svg = await data.text();
  return { props: { svg } };
};

export default function Home(props: any) {
  return <div dangerouslySetInnerHTML={{ __html: props.svg }}></div>;
}
