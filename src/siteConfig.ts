export type WeddingDetails = {
  dateISO: string | null
  dateLabel: string | null
  locationLabel: string | null
  venueLabel: string | null
}

const weddingDetails: WeddingDetails = {
  dateISO: null,
  dateLabel: null,
  locationLabel: null,
  venueLabel: null,
}

export const siteConfig = {
  couple: {
    first: 'Lexi',
    second: 'Chris',
  },
  details: weddingDetails,
  copy: {
    eyebrow: 'save the date',
    invitation: 'formal invitation to follow',
    footer: 'made with love',
  },
  features: {
    messageFormEnabled: false,
    honeymoonEnabled: false,
  },
}
