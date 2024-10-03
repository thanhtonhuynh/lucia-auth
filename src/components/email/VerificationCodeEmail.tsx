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

type VerificationCodeEmailProps = {
  code: string;
};

VerificationCodeEmail.PreviewProps = {
  code: '123456',
};

export default function VerificationCodeEmail({
  code,
}: VerificationCodeEmailProps) {
  return (
    <Html>
      <Preview>Verification Code for Lucia Auth</Preview>
      <Tailwind>
        <Head />
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
