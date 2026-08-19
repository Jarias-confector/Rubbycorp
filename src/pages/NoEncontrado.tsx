import { Link } from 'react-router-dom'

export default function NoEncontrado() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-6 py-28 text-center">
      <img
        src={`${import.meta.env.BASE_URL}brand/rubby-mark.png`}
        alt=""
        className="w-24 opacity-70"
      />
      <h1 className="mt-8 text-[clamp(2.4rem,6vw,3.6rem)] text-ink">Página no encontrada</h1>
      <p className="mt-4 text-sm leading-relaxed text-ink-soft">
        La ruta que buscas no existe o cambió de lugar. Vuelve al inicio o explora la tienda.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to="/" className="btn-primary">
          Ir al inicio
        </Link>
        <Link to="/tienda" className="btn-ghost">
          Ver la tienda
        </Link>
      </div>
    </div>
  )
}
