import { BuyerWorkspace } from '../../components/Buyer/BuyerWorkspace';

export default function BuyerPage() {
  // Explicit sample mode until the public API is integrated. Users can switch
  // to the system source to test the real endpoint; failures never use samples.
  return <BuyerWorkspace initialMode="sample" />;
}
