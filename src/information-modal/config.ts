const getTravellersConfig = (): TravellerInfo[] => [
  {
    name: _('Rich Merchant'),
    inDeck: '(x2)',
    defense: 1,
    success: _('2 Shillings / 4 Shillings (Victim)'),
    failure: _('No effect / 2 Shillings to Sheriff'),
    image: 'RichMerchant',
  },
  {
    name: _('Noble Knight'),
    inDeck: '(x2)',
    defense: 2,
    success: _('3 Shillings / 5 Shillings (Victim)'),
    failure: _('No effect / Captured'),
    image: 'NobleKnight',
  },
  {
    name: _('Monks'),
    inDeck: '(x3)',
    defense: 0,
    success: _('1 Shilling / 3 Shillings (Victim)'),
    failure: _('No effect / Submissive'),
    image: 'Monks',
  },
  {
    name: _('The Potter'),
    inDeck: '(x1)',
    defense: 1,
    success: _('3 Shillings / 2 from Sheriff and +1 Justice (Victim)'),
    failure: _('No effect / Robin Hood Captured (+1 Order)'),
    image: 'ThePotter',
  },
  {
    name: _('The Miller\'s Son'),
    inDeck: '(x1)',
    defense: 0,
    success: _('2 Shillings / 1 Shilling and Merry Man (Victim)'),
    failure: _('No effect / Henchman'),
    image: 'TheMillersSon',
  },
  {
    name: _('Bishop of Hereford'),
    inDeck: _('(x1 added by Event)'),
    defense: 1,
    success: _('3 Shillings / 6 Shillings (Victim)'),
    failure: _('No effect / 3 Shillings to Sheriff and Submissive'),
    image: 'BishopOfHereford',
  },
  {
    name: _('Guy of Gisborne'),
    inDeck: _('(x1 added by Event)'),
    defense: 3,
    success: _('Remove'),
    failure: _('Captured'),
    image: 'GuyOfGisborne',
  },
  {
    name: _('Richard at the Lea'),
    inDeck: '(x1)',
    defense: 1,
    success: _('2 Shillings'),
    failure: _('No Effect'),
    extraText: _('Or pay 3 Shillings for Camp and Revolt in Retford'),
    image: 'RichardAtTheLea',
  },
]

const robSummarySteps = (): string[] => {
  return [
    _('Reveal at least one Hidden Merry Man in the Rob space (or use Robin Hood)'),
    _('Select a target: a Traveller drawn from the deck, a Carriage in the space, or the Treasury if in Nottingham'),
    _('Select Traveller option or reveal Carriage'),
    _('Roll a green die in Forests and Revolting Parishes, or a white die in Submissive or Passive spaces'),
    _('If the number of just Revealed Merry Men (always count Robin Hood, even if already Revealed) plus the die result is greater than the target\'s Defense plus the number of Henchmen in the space, the Rob is a success, otherwise it is a failure'),
  ]
}

const carriagesRobInfo = (): {image: string; title: string; name: string; defense: number; success: string; failure: string; nottingham: string;}[] => {
  return [
    {
      image: 'TallageCarriage',
      name: _('Tallage Carriage'),
      defense: 0,
      title: _('Tallage: 0 Defense'),
      success: _('${tkn_boldItalicText_success} 5 Shillings, send to Used Carriages'),
      failure: _('${tkn_boldItalicText_failure} No effect (Carriage stays revealed)'),
      nottingham: _('5 Shillings, +1 Order'),
    },
    {
      image: 'TributeCarriage',
      name: _('Tribute Carriage'),
      defense: 0,
      title: _('Tribute: 0 Defense'),
      success: _('${tkn_boldItalicText_success} 2 Shillings, +1 Justice, send to Used Carriages'),
      failure: _('${tkn_boldItalicText_failure} No effect (Carriage stays revealed)'),
      nottingham: _('2 Shillings, +2 Order'),
    },
    {
      image: 'TrapCarriage',
      name: _('Trap Carriage'),
      defense: 2,
      title: _('Trap: 2 Defense'),
      success: _('${tkn_boldItalicText_success} 2 Shillings, send to Used Carriages'),
      failure: _('${tkn_boldItalicText_failure} Captured (Carriage stays revealed)'),
      nottingham: _('2 Shillings, +1 Order'),
    }
  ]
}

