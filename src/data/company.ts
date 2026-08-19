/** Datos de la empresa tomados del brief. */
export const company = {
  name: 'Rubby Corp',
  since: 2017,
  email: 'rubby.corp.oficial@gmail.com',
  whatsapp: '5219981030007',
  whatsappDisplay: '998 103 0007',
  tagline: 'Oportunidades que están al alcance de todos.',
  // Datos bancarios para recargas del monedero. Sustituir por los reales antes de publicar.
  bank: {
    bank: 'BBVA México',
    holder: 'Rubby Corp',
    clabe: '012 000 0000 0000 00',
    account: '0000000000',
    card: '4152 0000 0000 0000',
    concept: 'Tu correo registrado',
  },
}

export const waLink = (msg: string) =>
  `https://wa.me/${company.whatsapp}?text=${encodeURIComponent(msg)}`
