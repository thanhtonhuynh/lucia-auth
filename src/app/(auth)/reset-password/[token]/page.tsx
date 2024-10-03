type PageProps = {
  params: {
    token: string;
  };
};

export default function Page({ params: { token } }: PageProps) {
  return <div>{token}</div>;
}
