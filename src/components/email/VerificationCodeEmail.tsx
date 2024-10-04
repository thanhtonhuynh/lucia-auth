import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Tailwind,
  Text,
} from '@react-email/components';

VerificationCodeEmail.PreviewProps = {
  code: '123456',
};

export default function VerificationCodeEmail({ code }: { code: string }) {
  return (
    <Html>
      <Head />
      <Preview>Verification Code for Lucia Auth</Preview>
      <Tailwind>
        <Body className="font-sans bg-white">
          <Container className="max-w-xl">
            <Heading>Verification Code</Heading>
            <Text>Your verfication code is: {code}</Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
