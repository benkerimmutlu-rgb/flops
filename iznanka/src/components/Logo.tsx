export function Logo({
  size = 20,
  glow = false,
  center = false,
}: {
  size?: number;
  glow?: boolean;
  center?: boolean;
}) {
  return (
    <span
      className={
        "logo" + (glow ? "" : " logo--flat") + (center ? " logo--center" : "")
      }
      style={{ fontSize: size }}
      role="img"
      aria-label="IZNANKA"
    >
      <span className="logo__word" aria-hidden="true">
        IZN<span className="logo__a">A</span>NKA
      </span>
      {glow && (
        <span className="logo__tag" aria-hidden="true">
          Фундаментальное обучение психологии
        </span>
      )}
    </span>
  );
}

export function PhoneShell({
  children,
  black = false,
}: {
  children: React.ReactNode;
  black?: boolean;
}) {
  return (
    <div className="stage">
      <div className={"phone" + (black ? " phone--black" : "")}>
        <div className="phone__status">
          <span className="label-sm">9:41</span>
          <span className="phone__island" />
          <span className="phone__dots">
            <i />
            <i />
            <i />
          </span>
        </div>
        <div className="phone__scroll">{children}</div>
        <div className="phone__home" />
      </div>
    </div>
  );
}
