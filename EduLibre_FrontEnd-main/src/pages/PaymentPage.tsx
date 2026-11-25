import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Feedback from '../components/Feedback';
import { fetchBooking, payBooking } from '../services/bookings';
import type { Booking } from '../types';
import { getErrorMessage } from '../utils/validation';

type PaymentMethod = 'pix' | 'card';

function formatCurrency(value?: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(value ?? 0));
}

function formatCardNumber(value: string) {
  return value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
}

function PaymentPage() {
  const { id } = useParams();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [method, setMethod] = useState<PaymentMethod>('pix');
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchBooking(id)
      .then(setBooking)
      .catch((requestError) => setError(getErrorMessage(requestError)));
  }, [id]);

  const amount = useMemo(() => Number(booking?.aula?.valor ?? 0), [booking]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!booking) return;

    try {
      setError('');
      setLoading(true);
      const updatedBooking = await payBooking(booking.id, {
        method,
        ...(method === 'card'
          ? { cardNumber: cardNumber.replace(/\D/g, ''), cardHolder }
          : {}),
      });
      setSuccess('Pagamento simulado aprovado. Seu agendamento está confirmado.');
      setBooking(updatedBooking);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  if (!booking) {
    return <main className="marketing-shell"><div className="center-card">Carregando checkout...</div></main>;
  }

  const paymentAvailable = booking.bookingStatus === 'aceito' && booking.paymentStatus !== 'pago';

  return (
    <main className="marketing-shell payment-page">
      <section className="payment-heading">
        <p className="eyebrow">Checkout seguro</p>
        <h1>Finalize seu agendamento</h1>
        <p className="muted">Ambiente de demonstração: nenhum valor será cobrado.</p>
      </section>

      <div className="payment-layout">
        <form className="payment-card" onSubmit={handleSubmit}>
          <h2>Como deseja pagar?</h2>
          <div className="payment-methods" role="radiogroup" aria-label="Forma de pagamento">
            <button
              type="button"
              className={method === 'pix' ? 'payment-method payment-method-active' : 'payment-method'}
              onClick={() => setMethod('pix')}
              disabled={!paymentAvailable || Boolean(success)}
            >
              <span>Pix</span>
              <small>Aprovação imediata</small>
            </button>
            <button
              type="button"
              className={method === 'card' ? 'payment-method payment-method-active' : 'payment-method'}
              onClick={() => setMethod('card')}
              disabled={!paymentAvailable || Boolean(success)}
            >
              <span>Cartão</span>
              <small>Dados apenas para teste</small>
            </button>
          </div>

          {method === 'pix' ? (
            <div className="pix-panel">
              <div className="pix-code" aria-hidden="true"><span>PIX</span></div>
              <div>
                <strong>Pix simulado</strong>
                <p>Ao confirmar, a plataforma aprova o pagamento de demonstração instantaneamente.</p>
              </div>
            </div>
          ) : (
            <div className="payment-fields">
              <label className="field">
                <span>Número do cartão</span>
                <input
                  inputMode="numeric"
                  autoComplete="cc-number"
                  placeholder="0000 0000 0000 0000"
                  value={cardNumber}
                  onChange={(event) => setCardNumber(formatCardNumber(event.target.value))}
                  disabled={!paymentAvailable || Boolean(success)}
                />
              </label>
              <label className="field">
                <span>Nome no cartão</span>
                <input
                  autoComplete="cc-name"
                  placeholder="Como impresso no cartão"
                  value={cardHolder}
                  onChange={(event) => setCardHolder(event.target.value)}
                  disabled={!paymentAvailable || Boolean(success)}
                />
              </label>
              <p className="payment-hint">Para testar uma recusa, use um cartão que termine em 0000.</p>
            </div>
          )}

          {error ? <Feedback message={error} /> : null}
          {success ? <Feedback variant="success" message={success} /> : null}

          {success ? (
            <Link className="primary-button" to={`/agendamentos/${booking.id}`}>Ver agendamento</Link>
          ) : (
            <button className="primary-button" type="submit" disabled={!paymentAvailable || loading}>
              {loading ? 'Processando pagamento...' : `Pagar ${formatCurrency(amount)}`}
            </button>
          )}
          {!paymentAvailable && !success ? (
            <p className="payment-hint">O pagamento será liberado quando o professor aceitar o agendamento.</p>
          ) : null}
        </form>

        <aside className="payment-summary">
          <p className="eyebrow">Resumo do pedido</p>
          <h2>{booking.aula?.materia ?? 'Aula particular'}</h2>
          <dl>
            <div><dt>Professor</dt><dd>{booking.aula?.professor?.name ?? 'Não informado'}</dd></div>
            <div><dt>Data</dt><dd>{new Date(booking.data).toLocaleString('pt-BR')}</dd></div>
            <div><dt>Valor da aula</dt><dd>{formatCurrency(amount)}</dd></div>
          </dl>
          <div className="payment-total"><span>Total</span><strong>{formatCurrency(amount)}</strong></div>
          <p className="payment-security">Pagamento simulado · Nenhum dado bancário é armazenado.</p>
        </aside>
      </div>
      <Link className="text-link" to={`/agendamentos/${booking.id}`}>← Voltar ao agendamento</Link>
    </main>
  );
}

export default PaymentPage;
