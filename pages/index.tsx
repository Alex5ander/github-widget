export const getServerSideProps = async () => {
  const data = await fetch('http://localhost:3000/api/visit');
  const svg = await data.text();
  return { props: { svg } };
};

export default function Home(props: any) {
  return <div dangerouslySetInnerHTML={{ __html: props.svg }}></div>;
}
