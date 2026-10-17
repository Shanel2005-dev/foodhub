type PaymentBrand = 'mtn_momo' | 'moov_money';

const PAYMENT_BRAND_LOGOS: Record<PaymentBrand, { src: string; alt: string }> = {
  mtn_momo: { src: '/logos/mtn-logo.svg', alt: 'Logo MTN' },
  moov_money: { src: '/logos/moov-money-flooz.png', alt: 'Logo Moov Money' },
};

type PaymentBrandLogoProps = {
  brand: PaymentBrand;
  className?: string;
};

export default function PaymentBrandLogo({ brand, className = '' }: PaymentBrandLogoProps) {
  const logo = PAYMENT_BRAND_LOGOS[brand];

  return <img src={logo.src} alt={logo.alt} className={className} />;
}
