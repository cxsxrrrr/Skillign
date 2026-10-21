import Icon from "./Icon";

const icons = {
  success: "check",
  error: "x",
  info: "spark",
};

export function Alert({ type = "info", message }) {
  if (!message) return null;
  return (
    <div
      className={`nb-alert nb-alert--${type}`}
      role={type === "error" ? "alert" : "status"}
    >
      <span className="nb-alert__icon">
        <Icon name={icons[type] || "spark"} />
      </span>
      <p>{message}</p>
    </div>
  );
}

export function FlashGroup({ items }) {
  const messages = (items || []).filter((item) => item?.message);
  if (messages.length === 0) return null;
  return (
    <div className="nb-flashes">
      {messages.map((item, index) => (
        <Alert key={`${item.type}-${index}`} type={item.type} message={item.message} />
      ))}
    </div>
  );
}
