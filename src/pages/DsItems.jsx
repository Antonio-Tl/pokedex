import DsDevice from '@/components/ds/DsDevice';
import Items from './Items';

// Items page in the dual-screen frame – the page itself is unchanged for now.
export default function DsItems() {
  return (
    <DsDevice
      embed={(
        <div className="ds-screen is-embed ds-scroll bg-background text-foreground font-sans">
          <Items />
        </div>
      )}
    />
  );
}
