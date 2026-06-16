import { IMAGES } from '@/lib/images'

export type PlantSlug = 'omoku' | 'trans-amadi' | 'afam' | 'eleme'

export type Plant = {
  slug: PlantSlug
  name: string
  image: string
  desc: string
  supplier: string
  imageLeft: boolean
}

export const plants: Plant[] = [
  {
    slug: 'omoku',
    name: 'Omoku Plant',
    image: IMAGES.plants.omoku,
    desc: 'The Omoku Power Plant is located beside the NAOC Gas Processing Plant in Obrikiri. It was commissioned in December 2006 and has six units of 25MW GE Nuovo Pignone heavy-duty gas turbines, totaling 150MW installed capacity. The plant generates power and transmits it to the national grid via its on-site 132KV switching facility through the Rumuosi Transmission Substation.',
    supplier: 'Nigerian Agip Oil Company (NAOC)',
    imageLeft: true,
  },
  {
    slug: 'trans-amadi',
    name: 'Trans Amadi Plant',
    image: IMAGES.plants.transAmadi,
    desc: 'The Trans-Amadi Power Plant is sited in a land area of about 4 Hectares. It has a total installed capacity of 136MW. The plant was commissioned in 2 phases. Phase I consists of 3 x 12MW solar mars gas turbines commissioned in October 2002, while Phase II consists of 4 x 25 MW Nuovo Pignone frame 5 gas turbines commissioned in May 2019. The Power plant has the following facilities: 4 x 25MW GE Nuovo Pignone gas turbines, 3 x 11 MW GE solar mars gas turbines, control buildings, 4 x 36MVA transformers (11KV/132KV), 3 X 73MVA (33KV/132KV) transformers and is supported by 2 black start generators for island mode startup.',
    supplier: 'Heirs Energies Limited',
    imageLeft: false,
  },
  {
    slug: 'afam',
    name: 'Afam Plant',
    image: IMAGES.plants.afam,
    desc: 'The Afam Power Plant is in Oyigbo LGA of Rivers State. It was commissioned in December 2011 with an installed GE (formerly Alstom) GT13E2 gas turbine of 180MW capacity Installed Capacity and 160MW, exporting an average of 3500MWH per day into the national grid. Evacuation System: 33kV/132kV.',
    supplier: 'Ohuru Trading Company and Accugas Eleme',
    imageLeft: true,
  },
  {
    slug: 'eleme',
    name: 'Eleme Plant',
    image: IMAGES.plants.eleme,
    desc: 'Eleme Power Station has 25MW currently available at the 75MW installed capacity. Plans are in progress to recover an additional 50MW by 2026. Commissioned Dec. 2023 Evacuation System: 33kV to Bilateral Customers. The plant has a provision for future evacuation at 132kV to the Grid.',
    supplier: 'Ohuru Trading Company',
    imageLeft: false,
  },
]

export function getPlantBySlug(slug: string): Plant | undefined {
  return plants.find((plant) => plant.slug === slug)
}
