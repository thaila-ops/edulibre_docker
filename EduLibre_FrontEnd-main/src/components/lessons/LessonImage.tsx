type Props = { src?: string | null; alt: string };

export default function LessonImage({ src, alt }: Props) {
  return src ? (
    <img className="teacher_img teacher_photo" src={src} alt={alt} />
  ) : (
    <div className="teacher_img" aria-hidden="true" />
  );
}
