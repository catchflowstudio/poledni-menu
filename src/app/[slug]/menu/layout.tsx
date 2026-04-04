export default function MenuEmbedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <style>{`
        html, body {
          background: transparent !important;
          margin: 0 !important;
          padding: 0 !important;
          min-height: 0 !important;
          height: auto !important;
        }
        body::before,
        body::after {
          display: none !important;
        }
      `}</style>
      {children}
    </>
  );
}
