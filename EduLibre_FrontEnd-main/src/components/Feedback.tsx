type Props = {
  message: string;
  variant?: 'error' | 'success';
};

function Feedback({ message, variant = 'error' }: Props) {
  return <p className={`feedback ${variant}`}>{message}</p>;
}

export default Feedback;
