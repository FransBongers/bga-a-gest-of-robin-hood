const SPACES_CONFIG: Record<
  string,
  {
    Camp?: LocationConfig;
    Henchmen?: LocationConfig;
    MerryMen?: LocationConfig;
    Carriage?: LocationConfig;
  }
> = {
  [BINGHAM]: {
    [HENCHMEN]: {
      top: 1253,
      left: 737,
      width: 89,
      height: 143,
    },
    [CAMP]: {
      top: 1201,
      left: 869,
      width: 50,
      height: 50,
    },
    [MERRY_MEN]: {
      top: 1237,
      left: 931,
      width: 82,
      height: 170,
    },
    [CARRIAGE]: {
      top: 1401,
      left: 805,
      width: 100,
      height: 50,
    },
  },
  [BLYTH]: {
    [HENCHMEN]: {
      top: 565,
      left: 641,
      width: 100,
      height: 160,
    },
    [CAMP]: {
      top: 470,
      left: 585,
      width: 50,
      height: 50,
    },
    [MERRY_MEN]: {
      top: 544,
      left: 525,
      width: 100,
      height: 160,
    },
    [CARRIAGE]: {
      top: 482,
      left: 772,
      width: 50,
      height: 100,
    },
  },
  [MANSFIELD]: {
    [HENCHMEN]: {
      top: 1110,
      left: 313,
      width: 100,
      height: 150,
    },
    [CAMP]: {
      top: 837,
      left: 273,
      width: 50,
      height: 50,
    },
    [MERRY_MEN]: {
      top: 829,
      left: 329,
      width: 100,
      height: 145,
    },
    [CARRIAGE]: {
      top: 1010,
      left: 253,
      width: 50,
      height: 100,
    },
  },
  [NEWARK]: {
    [HENCHMEN]: {
      top: 688,
      left: 1081,
      width: 100,
      height: 145,
    },
    [CAMP]: {
      top: 1090,
      left: 916,
      width: 50,
      height: 50,
    },
    [MERRY_MEN]: {
      top: 1017,
      left: 977,
      width: 100,
      height: 170,
    },
    [CARRIAGE]: {
      top: 632,
      left: 1136,
      width: 100,
      height: 50,
    },
  },
  [NOTTINGHAM]: {
    [HENCHMEN]: {
      top: 1113,
      left: 474,
      width: 175,
      height: 100,
    },
    // [CAMP]: {
    //   top: 922,
    //   left: 112,
    //   width: 100,
    //   height: 100,
    // },
    [MERRY_MEN]: {
      top: 1039,
      left: 474,
      width: 170,
      height: 79,
    },
    [CARRIAGE]: {
      top: 1090,
      left: 634,
      width: 50,
      height: 100,
    },
  },
  [OLLERTON_HILL]: {
    // [HENCHMEN]: {
    //   top: 922,
    //   left: 112,
    //   width: 100,
    //   height: 100,
    // },
    [CAMP]: {
      top: 862,
      left: 778,
      width: 50,
      height: 50,
    },
    // [MERRY_MEN]: {
    //   top: 922,
    //   left: 112,
    //   width: 100,
    //   height: 100,
    // },
  },
  [REMSTON]: {
    [HENCHMEN]: {
      top: 1383,
      left: 624,
      width: 100,
      height: 160,
    },
    [CAMP]: {
      top: 1300,
      left: 507,
      width: 50,
      height: 50,
    },
    [MERRY_MEN]: {
      top: 1355,
      left: 416,
      width: 100,
      height: 160,
    },
    [CARRIAGE]: {
      top: 1519,
      left: 511,
      width: 100,
      height: 50,
    },
  },
  [RETFORD]: {
    [HENCHMEN]: {
      top: 317,
      left: 971,
      width: 100,
      height: 143,
    },
    [CAMP]: {
      top: 244,
      left: 766,
      width: 50,
      height: 50,
    },
    [MERRY_MEN]: {
      top: 317,
      left: 866,
      width: 100,
      height: 143,
    },
    [CARRIAGE]: {
      top: 209,
      left: 989,
      width: 50,
      height: 100,
    },
  },
  [SHIRE_WOOD]: {
    [HENCHMEN]: {
      top: 769,
      left: 467,
      width: 160,
      height: 68,
    },
    [CAMP]: {
      top: 906,
      left: 610,
      width: 50,
      height: 50,
    },
    [MERRY_MEN]: {
      top: 886,
      left: 467,
      width: 140,
      height: 100,
    },
    [CARRIAGE]: {
      top: 837,
      left: 467,
      width: 50,
      height: 50,
    },
  },
  [SOUTHWELL_FOREST]: {
    [HENCHMEN]: {
      top: 937,
      left: 671,
      width: 84,
      height: 124,
    },
    [CAMP]: {
      top: 1135,
      left: 762,
      width: 50,
      height: 50,
    },
    [MERRY_MEN]: {
      top: 987,
      left: 762,
      width: 100,
      height: 100,
    },
    [CARRIAGE]: {
      top: 931,
      left: 771,
      width: 50,
      height: 50,
    },
  },
  [TUXFORD]: {
    [HENCHMEN]: {
      top: 814,
      left: 864,
      width: 100,
      height: 161,
    },
    [CAMP]: {
      top: 627,
      left: 864,
      width: 50,
      height: 50,
    },
    [MERRY_MEN]: {
      top: 514,
      left: 932,
      width: 100,
      height: 161,
    },
    [CARRIAGE]: {
      top: 706,
      left: 823,
      width: 50,
      height: 100,
    },
  },
};

const JUSTICE_TRACK_CONFIG: TrackConfig[] = [
  {
    id: 'justiceTrack_1',
    top: 904,
    left: 112,
    extraClasses: 'gest_marker_space gest_justice_order_track',
  },
  {
    id: 'justiceTrack_2',
    top: 803,
    left: 112,
    extraClasses: 'gest_marker_space gest_justice_order_track',
  },
  {
    id: 'justiceTrack_3',
    top: 702,
    left: 112,
    extraClasses: 'gest_marker_space gest_justice_order_track',
  },
  {
    id: 'justiceTrack_4',
    top: 601,
    left: 112,
    extraClasses: 'gest_marker_space gest_justice_order_track',
  },
  {
    id: 'justiceTrack_5',
    top: 500,
    left: 112,
    extraClasses: 'gest_marker_space gest_justice_order_track',
  },
  {
    id: 'justiceTrack_6',
    top: 399,
    left: 112,
    extraClasses: 'gest_marker_space gest_justice_order_track',
  },
  {
    id: 'justiceTrack_7',
    top: 298,
    left: 112,
    extraClasses: 'gest_marker_space gest_justice_order_track',
  },
];

const ORDER_TRACK: TrackConfig[] = [
  {
    id: 'orderTrack_1',
    top: 1029,
    left: 112,
    extraClasses: 'gest_marker_space gest_justice_order_track',
  },
  {
    id: 'orderTrack_2',
    top: 1130,
    left: 112,
    extraClasses: 'gest_marker_space gest_justice_order_track',
  },
  {
    id: 'orderTrack_3',
    top: 1231,
    left: 112,
    extraClasses: 'gest_marker_space gest_justice_order_track',
  },
  {
    id: 'orderTrack_4',
    top: 1332,
    left: 112,
    extraClasses: 'gest_marker_space gest_justice_order_track',
  },
  {
    id: 'orderTrack_5',
    top: 1433,
    left: 112,
    extraClasses: 'gest_marker_space gest_justice_order_track',
  },
  {
    id: 'orderTrack_6',
    top: 1534,
    left: 112,
    extraClasses: 'gest_marker_space gest_justice_order_track',
  },
  {
    id: 'orderTrack_7',
    top: 1635,
    left: 112,
    extraClasses: 'gest_marker_space gest_justice_order_track',
  },
];

const ROYAL_INSPECTION_TRACK: TrackConfig[] = [
  {
    id: 'royalInspectionTrack_unrest',
    top: 862,
    left: 1210,
    extraClasses: 'gest_marker_space gest_royal_inspection_track',
  },
  {
    id: 'royalInspectionTrack_mischief',
    top: 956,
    left: 1210,
    extraClasses: 'gest_marker_space gest_royal_inspection_track',
  },
  {
    id: 'royalInspectionTrack_governance',
    top: 1047,
    left: 1210,
    extraClasses: 'gest_marker_space gest_royal_inspection_track',
  },
  {
    id: 'royalInspectionTrack_redeployment',
    top: 1138,
    left: 1210,
    extraClasses: 'gest_marker_space gest_royal_inspection_track',
  },
  {
    id: 'royalInspectionTrack_reset',
    top: 1228,
    left: 1210,
    extraClasses: 'gest_marker_space gest_royal_inspection_track',
  },
  {
    id: 'royalInspectionTrack_balad',
    top: 710,
    left: 1233,
    extraClasses: 'gest_marker_space gest_royal_inspection_track',
  },
];

const PARISH_STATUS_BOXES: TrackConfig[] = [
  {
    id: 'parishStatusBox_Retford',
    top: 204,
    left: 883,
    extraClasses: 'gest_parish_status_box',
  },
  {
    id: 'parishStatusBox_Blyth',
    top: 443,
    left: 669,
    extraClasses: 'gest_parish_status_box',
  },
  {
    id: 'parishStatusBox_Tuxford',
    top: 698,
    left: 890,
    extraClasses: 'gest_parish_status_box',
  },
  {
    id: 'parishStatusBox_Newark',
    top: 886,
    left: 1060,
    extraClasses: 'gest_parish_status_box',
  },
  {
    id: 'parishStatusBox_Mansfield',
    top: 986,
    left: 311,
    extraClasses: 'gest_parish_status_box',
  },
  {
    id: 'parishStatusBox_Bingham',
    top: 1276,
    left: 834,
    extraClasses: 'gest_parish_status_box',
  },
  {
    id: 'parishStatusBox_Remston',
    top: 1380,
    left: 528,
    extraClasses: 'gest_parish_status_box',
  },
];

const INITIATIVE_TRACK: TrackConfig[] = [
  {
    id: 'initiativeTrack_singlePlot',
    top: 1596,
    left: 1094,
    extraClasses: 'gest_marker_space gest_initiative_track',
  },
  {
    id: 'initiativeTrack_event',
    top: 1588,
    left: 1191,
    extraClasses: 'gest_marker_space gest_initiative_track',
  },
  {
    id: 'initiativeTrack_plotsAndDeeds',
    top: 1580,
    left: 1286,
    extraClasses: 'gest_marker_space gest_initiative_track',
  },
  {
    id: 'initiativeTrack_firstEligible',
    top: 1785,
    left: 1146,
    extraClasses: 'gest_marker_space gest_initiative_track',
  },
  {
    id: 'initiativeTrack_secondEligible',
    top: 1773,
    left: 1269,
    extraClasses: 'gest_marker_space gest_initiative_track',
  },
];

const UNIQUE_SPACES: TrackConfig[] = [
  {
    id: 'Carriage_usedCarriages',
    top: 505,
    left: 249,
  },
  {
    id: `${MERRY_MEN}_prison`,
    top: 147,
    left: 1182,
  },
];

const BRIDGE_LOCATIONS: TrackConfig[] = [
  {
    id: BLYTH_RETFORD_BORDER,
    top: 345,
    left: 819,
    extraClasses: 'gest_bridge_location',
  },
  {
    id: BINGHAM_NEWARK_BORDER,
    top: 1182,
    left: 934,
    extraClasses: 'gest_bridge_location',
  },
  {
    id: BINGHAM_SOUTHWELL_FOREST_BORDER,
    top: 1185,
    left: 736,
    extraClasses: 'gest_bridge_location',
  },
  {
    id: BINGHAM_NOTTINGHAM_BORDER,
    top: 1227,
    left: 613,
    extraClasses: 'gest_bridge_location',
  },
  {
    id: NOTTINGHAM_REMSTON_BORDER,
    top: 1246,
    left: 537,
    extraClasses: 'gest_bridge_location',
  },
];
