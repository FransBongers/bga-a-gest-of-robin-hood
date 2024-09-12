
const getRobinHoodPlotsAndDeeds = (): {
  plots: PlotOrDeedInfo[];
  deeds: PlotOrDeedInfo[];
} => ({
  plots: [
    {
      id: 'recruit',
      title: _('Recruit'),
      cost: _('1 Shilling per space.'),
      location: _('Up to 3 non-Submissive spaces.'),
      procedure: _(
        'Place 1 Merry Man, or replace a Merry Man (not Robin Hood) with a Camp (+1 Justice). If there is already a Camp, instead place up to 2 Merry Men or flip all Hidden.'
      ),
    },
    {
      id: 'sneak',
      title: _('Sneak'),
      cost: _('1 Shilling per origin.'),
      location: _('Up to 3 origin spaces with Merry Men.'),
      procedure: _(
        'Move any Merry Men to adjacent spaces. If a destination is Submissive and moving Merry Men plus Henchmen there exceeds 3, Reveal them; otherwise Hide all moving Merry Men.'
      ),
    },
    {
      id: 'rob',
      title: _('Rob'),
      cost: _('0 Shillings.'),
      location: _('Up to 3 spaces with Hidden Merry Men and/or Robin Hood.'),
      procedure: _(
        "Select target and Reveal any number of Merry Men, then roll against target's Defense Value."
      ),
    },
  ],
  deeds: [
    {
      id: 'turncoat',
      title: _('Turncoat'),
      cost: _('1 Shilling.'),
      location: _('1 Revolting Parish with a Merry Man.'),
      procedure: _('Replace 1 Henchman with a Merry Man.'),
    },
    {
      id: 'donate',
      title: _('Donate'),
      cost: _('2 Shillings per Parish.'),
      location: _(
        'Up to 2 Submissive Parishes with any Merry Men equal or greater than Henchmen.'
      ),
      procedure: _('Set each Parish to Revolting.'),
    },
    {
      id: 'swashbuckle',
      title: _('Swashbuckle'),
      cost: _('0 Shillings.'),
      location: _('1 space with Robin Hood.'),
      procedure: _(
        'Hide Robin Hood and up to 1 Merry Man, then move them to any adjacent spaces; or place Robin Hood from Prison in or adjacent to Nottingham, Revealed.'
      ),
    },
    {
      id: 'inspire',
      title: _('Inspire'),
      cost: _('0 Shillings.'),
      location: _('1 Parish with Hidden Robin Hood.'),
      procedure: _(
        'Reveal Robin Hood to set the Parish to Revolting, or if it is already Revolting instead Reveal Robin Hood to shift Royal Favour one step towards Justice.'
      ),
    },
  ],
});

const getSheriffPlotsAndDeeds = (): {
  plots: PlotOrDeedInfo[];
  deeds: PlotOrDeedInfo[];
} => ({
  plots: [
    {
      id: 'hire',
      title: _('Hire'),
      cost: _('2 Shilling per space.'),
      location: _('Up to 3 spaces (see Procedure for details).'),
      procedure: _(
        'Place up to 2 Henchmen in Submissive Parishes, up to 4 Henchmen in Nottingham, and set Revolting Parishes with more Henchmen than Merry Men to Submissive.'
      ),
    },
    {
      id: 'patrol',
      title: _('Patrol'),
      cost: _('2 Shillings per destination.'),
      location: _('Up to 3 destination spaces.'),
      procedure: _(
        'Move in any number of Henchmen from adjacent spaces, then reveal 1 Merry Man per Henchmen now there (or per 2 Henchmen in Forest).'
      ),
    },
    {
      id: 'capture',
      title: _('Capture'),
      cost: _('0 Shillings.'),
      location: _('Up to 3 spaces with Henchmen.'),
      procedure: _(
        'Remove 1 Revealed enemy piece per Henchmen (or per 2 Henchmen in Revolting Parishes). Remove Merry Men to Prison (Robin Hood then Camps last).'
      ),
    },
  ],
  deeds: [
    {
      id: 'ride',
      title: _('Ride'),
      cost: _('0 Shilling.'),
      location: _('Nottingham and 1 Parish.'),
      procedure: _('Move up to 4 Henchmen from Nottingham to any one Parish.'),
    },
    {
      id: 'confiscate',
      title: _('Confiscate'),
      cost: _('0 Shillings.'),
      location: _('Up to 2 Submissive Parishes with Henchmen.'),
      procedure: _(
        'Place an Available Carriage in each Parish, then set each Parish where a Carriage was placed to Revolting.'
      ),
    },
    {
      id: 'disperse',
      title: _('Disperse'),
      cost: _('3 Shillings.'),
      location: _('1 Parish with Henchmen.'),
      procedure: _(
        'Remove 2 enemy pieces to Available (Camps last, shift one step towards Order if a Camp is removed), then set the Parish to Revolting.'
      ),
    },
  ],
});
