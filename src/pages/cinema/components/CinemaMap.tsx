const CinemaMap = ({ mapLocation }: { mapLocation: string }) => {
  return (
    <div style={{ width: "100%", margin: "24px 0" }}>
      <iframe
        src={mapLocation}
        width="100%"
        height="450"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
      />
    </div>
  );
};

export default CinemaMap;
