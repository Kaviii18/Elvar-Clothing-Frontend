const WhatsAppButton = () => {
  // WhatsApp number in international format (Sri Lanka example)
  const phoneNumber = "94771234567";

  const message = "Hi, I need some assistance with my order.";

  return (
    <a
      href={`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-5 right-5 sm:bottom-8 sm:right-8 z-50 flex items-center justify-center rounded-full bg-[#25D366] p-3 sm:p-4 shadow-lg transition-transform duration-300 hover:scale-110"
    >
      <img
        src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
        alt="WhatsApp"
        className="w-6 h-6 sm:w-8 sm:h-8"
      />
    </a>
  );
};

export default WhatsAppButton;