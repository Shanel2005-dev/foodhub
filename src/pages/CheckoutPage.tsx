import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MapPin, Phone, CreditCard, ArrowLeft, Clock, Store, Check, CheckCircle2, TriangleAlert } from 'lucide-react';
import PaymentBrandLogo from '../components/PaymentBrandLogo';
import { useCartStore } from '../store/cartStore';
import { useOrderStore } from '../store/orderStore';
import { mockEstablishments, QUARTIERS_PARAKOU, getDeliveryFee } from '../data/mock';

const isValidPhone = (phone: string) => /^(229)?[0-9]{8}$/.test(phone.replace(/\s+/g, ''));

const schema = z.object({
  quartierLivraison: z.string().min(1, 'Choisissez un quartier'),
  pointRepere: z.string().min(5, 'Précisez le point de repère (min 5 caractères)'),
  telephone: z.string().refine(isValidPhone, 'Numéro invalide (ex: 97 00 00 00)'),
  paymentMethod: z.enum(['mtn_momo', 'moov_money', 'especes_livraison']),
  telephoneMomo: z.string().optional(),
}).superRefine((data, context) => {
  if (data.paymentMethod !== 'especes_livraison' && !isValidPhone(data.telephoneMomo ?? '')) {
    context.addIssue({
      code: 'custom',
      path: ['telephoneMomo'],
      message: 'Saisissez un numéro Mobile Money valide (ex: 97 00 00 00)',
    });
  }
});

type FormData = z.infer<typeof schema>;

const PAYMENT_OPTIONS = [
  { value: 'mtn_momo', label: 'MTN Mobile Money' },
  { value: 'moov_money', label: 'Moov Money' },
  { value: 'especes_livraison', label: 'Espèces à la livraison' },
] as const;

export default function CheckoutPage() {
  const { items, total, establishmentId, establishmentName, quartierLivraison: storedQuartier, clearCart } = useCartStore();
  const createOrder = useOrderStore((state) => state.createOrder);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [momoStatus, setMomoStatus] = useState<'idle' | 'waiting' | 'confirmed'>('idle');
  const [confirmedPaymentKey, setConfirmedPaymentKey] = useState<string | null>(null);

  const establishment = mockEstablishments.find(e => e.id === establishmentId);
  const subtotal = total();

  const { register, handleSubmit, control, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      quartierLivraison: storedQuartier ?? '',
      paymentMethod: 'mtn_momo',
    },
  });

  const paymentMethod = useWatch({ control, name: 'paymentMethod' });
  const telephoneMomo = useWatch({ control, name: 'telephoneMomo' });
  const quartierLivraison = useWatch({ control, name: 'quartierLivraison' });
  const paymentKey = `${paymentMethod}:${telephoneMomo?.replace(/\s/g, '') ?? ''}`;
  const deliveryFee = establishment && quartierLivraison
    ? getDeliveryFee(establishment.quartier, quartierLivraison)
    : 0;

  const onSubmit = async (formData: FormData) => {
    const usesMobileMoney = formData.paymentMethod !== 'especes_livraison';
    if (usesMobileMoney && confirmedPaymentKey !== paymentKey) {
      setMomoStatus('waiting');
      await new Promise(r => setTimeout(r, 3000));
      setConfirmedPaymentKey(paymentKey);
      setMomoStatus('confirmed');
      return;
    }
    setLoading(true);
    if (!establishmentId || !establishmentName) {
      setLoading(false);
      return;
    }
    const orderId = createOrder({
      items,
      establishmentId,
      establishmentName,
      subtotal,
      deliveryFee,
      quartierLivraison: formData.quartierLivraison,
      pointRepereLivraison: formData.pointRepere,
      customerPhone: formData.telephone.replace(/\s+/g, ''),
      paymentMethod: formData.paymentMethod,
    });
    clearCart();
    navigate(`/tracking?order=${encodeURIComponent(orderId)}`);
  };

  if (items.length === 0) { navigate('/'); return null; }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100"><ArrowLeft size={20} /></button>
          <h1 className="text-2xl font-bold text-gray-800">Finaliser la commande</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Quartier livraison */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <MapPin size={18} style={{ color: '#EA580C' }} /> Quartier de livraison
            </h2>
            <select
              {...register('quartierLivraison')}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 outline-none focus:border-orange-400"
            >
              <option value="">-- Choisir votre quartier --</option>
              {QUARTIERS_PARAKOU.map(q => (
                <option key={q} value={q}>{q}</option>
              ))}
            </select>
            {errors.quartierLivraison && <p className="text-red-500 text-xs mt-1">{errors.quartierLivraison.message}</p>}
            {quartierLivraison && (
              <p className="text-xs text-gray-500 mt-2">
                Frais de livraison : <strong>{deliveryFee.toLocaleString()} FCFA</strong>
              </p>
            )}
          </div>

          {/* Point de repère */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="font-bold text-gray-800 mb-1 flex items-center gap-2">
              <MapPin size={18} style={{ color: '#EA580C' }} /> Point de repère <span className="text-red-500 text-xs font-normal ml-1">obligatoire</span>
            </h2>
            <p className="text-xs text-gray-400 mb-3">Parakou n'a pas d'adressage formel. Décrivez où vous trouver.</p>
            <textarea
              {...register('pointRepere')}
              placeholder="Ex : Banikanni, derrière la grande mosquée, maison bleue avec portail en fer forgé"
              rows={3}
              className="w-full border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-orange-400 resize-none"
            />
            {errors.pointRepere && <p className="text-red-500 text-xs mt-1">{errors.pointRepere.message}</p>}
          </div>

          {/* Téléphone */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Phone size={18} style={{ color: '#EA580C' }} /> Votre numéro de téléphone
            </h2>
            <input
              {...register('telephone')}
              placeholder="97 00 00 00"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-400"
            />
            {errors.telephone && <p className="text-red-500 text-xs mt-1">{errors.telephone.message}</p>}
          </div>

          {/* Mode de paiement */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <CreditCard size={18} style={{ color: '#EA580C' }} /> Mode de paiement
            </h2>
            <div className="space-y-2.5">
              {PAYMENT_OPTIONS.map(pm => (
                <label
                  key={pm.value}
                  className="flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all"
                  style={{
                    borderColor: paymentMethod === pm.value ? '#EA580C' : '#e5e7eb',
                    backgroundColor: paymentMethod === pm.value ? '#fff7f0' : 'white',
                  }}
                >
                  <input type="radio" {...register('paymentMethod')} value={pm.value} className="sr-only" />
                  {pm.value === 'especes_livraison'
                    ? <div className="w-11 h-11 rounded-lg bg-emerald-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">ESP</div>
                    : <div className="w-11 h-11 rounded-lg bg-white border border-gray-100 flex items-center justify-center flex-shrink-0 p-1">
                        <PaymentBrandLogo
                          brand={pm.value}
                          className={pm.value === 'mtn_momo' ? 'w-9 h-auto rounded-full bg-yellow-400 p-1' : 'w-9 h-9 object-contain'}
                        />
                      </div>}
                  <span className="text-sm font-medium text-gray-700">{pm.label}</span>
                  {paymentMethod === pm.value && <Check size={15} className="ml-auto text-orange-500" />}
                </label>
              ))}
            </div>

            {/* Mobile Money phone input */}
            {(paymentMethod === 'mtn_momo' || paymentMethod === 'moov_money') && (
              <div className="mt-4">
                <div className="mb-3 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                  <TriangleAlert size={16} className="mt-0.5 shrink-0" />
                  <span>Mode démonstration : seul le montant des mets est simulé sur Mobile Money. Les frais de livraison se règlent directement au livreur à l'arrivée.</span>
                </div>
                <label className="text-sm text-gray-600 font-medium mb-2 block">
                  Numéro {paymentMethod === 'mtn_momo' ? 'MTN MoMo' : 'Moov Money'} à débiter
                </label>
                <input
                  {...register('telephoneMomo')}
                  placeholder="Ex : 97 00 00 00"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400"
                />
                {errors.telephoneMomo && <p className="text-red-500 text-xs mt-1">{errors.telephoneMomo.message}</p>}
                {momoStatus === 'waiting' && (
                  <div className="mt-3 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-amber-700 text-sm">
                    <Clock size={16} className="animate-pulse flex-shrink-0" />
                    <span>En attente de confirmation sur votre téléphone...</span>
                  </div>
                )}
                {momoStatus === 'confirmed' && confirmedPaymentKey === paymentKey && (
                  <div className="mt-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-green-700 text-sm font-medium flex items-center gap-2">
                    <CheckCircle2 size={16} /> Paiement des mets simulé. Aucun paiement réel n'a été encaissé.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Récapitulatif */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="font-bold text-gray-800 mb-3">Récapitulatif</h2>
            <p className="text-sm text-gray-500 mb-3 font-medium flex items-center gap-1.5"><Store size={14} /> {establishmentName}</p>
            {items.map(ci => (
              <div key={ci.item.id} className="flex justify-between text-sm py-1">
                <span className="text-gray-600">{ci.item.name} ×{ci.quantity}</span>
                <span className="font-medium">{(ci.item.price * ci.quantity).toLocaleString()} F</span>
              </div>
            ))}
            <div className="border-t mt-3 pt-3 space-y-1.5">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Sous-total</span><span>{subtotal.toLocaleString()} FCFA</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Livraison (à régler au livreur)</span><span>{deliveryFee.toLocaleString()} FCFA</span>
              </div>
              <div className="flex justify-between font-bold pt-1">
                <span>{paymentMethod === 'especes_livraison' ? 'Total à régler au livreur' : 'Total à payer sur la plateforme'}</span>
                <span style={{ color: '#EA580C' }}>
                  {(paymentMethod === 'especes_livraison' ? subtotal + deliveryFee : subtotal).toLocaleString()} FCFA
                </span>
              </div>
              <p className="rounded-lg bg-orange-50 px-3 py-2 text-xs font-medium text-orange-800">
                {paymentMethod === 'especes_livraison'
                  ? `Mets et livraison seront payés directement au livreur à l'arrivée : ${(subtotal + deliveryFee).toLocaleString()} FCFA.`
                  : `Les frais de livraison (${deliveryFee.toLocaleString()} FCFA) sont exclus du paiement sur la plateforme et seront réglés au livreur à l'arrivée.`}
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || momoStatus === 'waiting'}
            className="w-full text-white py-4 rounded-2xl font-bold text-base shadow-lg hover:opacity-90 disabled:opacity-60 transition-opacity"
            style={{ backgroundColor: '#EA580C' }}
          >
            {loading
              ? 'Traitement...'
              : momoStatus === 'waiting'
              ? 'En attente de confirmation...'
              : paymentMethod !== 'especes_livraison' && confirmedPaymentKey !== paymentKey
              ? 'Simuler le paiement des mets'
              : paymentMethod === 'especes_livraison'
              ? 'Créer la commande — paiement à la livraison'
              : 'Créer la commande de démonstration'}
          </button>
        </form>
      </div>
    </div>
  );
}
