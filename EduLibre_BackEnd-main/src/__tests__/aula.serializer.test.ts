import Aula from '../models/Aula';
import { serializeAula } from '../serializers/aula.serializer';

describe('Lesson response', () => {
  test('keeps review averages and paid booking counts', () => {
    const lesson = {
      toJSON: () => ({
        id: 7,
        materia: 'Matemática',
        professorId: 2,
        avaliacoes: [{ nota: 4 }, { nota: 5 }, { nota: 5 }],
        agendamentos: [
          { paymentStatus: 'pago' },
          { paymentStatus: 'pendente' },
        ],
      }),
    } as unknown as Aula;

    expect(serializeAula(lesson)).toMatchObject({
      id: 7,
      materia: 'Matemática',
      professorId: 2,
      reviewCount: 3,
      averageRating: 4.7,
      bookingCount: 2,
      paidBookingCount: 1,
    });
  });

  test('returns zero counts when associations are absent', () => {
    const lesson = { toJSON: () => ({ id: 7 }) } as unknown as Aula;
    expect(serializeAula(lesson)).toMatchObject({
      reviewCount: 0,
      averageRating: 0,
      bookingCount: 0,
      paidBookingCount: 0,
      avaliacoes: [],
    });
  });
});
