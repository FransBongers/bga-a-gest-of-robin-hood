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
      left: 709,
      width: 89,
      height: 143,
    },
    [CAMP]: {
      top: 1368,
      left: 944,
      width: 50,
      height: 50,
    },
    [MERRY_MEN]: {
      top: 1223,
      left: 949,
      width: 82,
      height: 170,
    },
    [CARRIAGE]: {
      top: 1159,
      left: 847,
      width: 100,
      height: 50,
    },
  },
  [BLYTH]: {
    [HENCHMEN]: {
      top: 530,
      left: 560,
      width: 10,
      height: 10,
    },
    [CAMP]: {
      top: 452,
      left: 591,
      width: 10,
      height: 10,
    },
    [MERRY_MEN]: {
      top: 294,
      left: 631,
      width: 10,
      height: 10,
    },
    [CARRIAGE]: {
      top: 439,
      left: 766,
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
      top: 938,
      left: 280,
      width: 50,
      height: 100,
    },
  },
  [NEWARK]: {
    [HENCHMEN]: {
      top: 678,
      left: 1111,
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
      top: 978,
      left: 995,
      width: 100,
      height: 170,
    },
    [CARRIAGE]: {
      top: 546,
      left: 1131,
      width: 100,
      height: 50,
    },
  },
  [NOTTINGHAM]: {
    [HENCHMEN]: {
      top: 1039,
      left: 535,
      width: 175,
      height: 100,
    },
    [MERRY_MEN]: {
      top: 1044,
      left: 508,
      width: 170,
      height: 79,
    },
    [CARRIAGE]: {
      top: 1030,
      left: 597,
      width: 50,
      height: 100,
    },
  },
  [OLLERTON_HILL]: {
    [CAMP]: {
      top: 862,
      left: 784,
      width: 50,
      height: 50,
    },
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
      top: 1499,
      left: 476,
      width: 100,
      height: 50,
    },
  },
  [RETFORD]: {
    [HENCHMEN]: {
      top: 315,
      left: 900,
      width: 100,
      height: 143,
    },
    [CAMP]: {
      top: 154,
      left: 879,
      width: 50,
      height: 50,
    },
    [MERRY_MEN]: {
      top: 156,
      left: 821,
      width: 100,
      height: 143,
    },
    [CARRIAGE]: {
      top: 145,
      left: 974,
      width: 50,
      height: 100,
    },
  },
  [SHIRE_WOOD]: {
    [HENCHMEN]: {
      top: 878,
      left: 456,
      width: 160,
      height: 68,
    },
    [CAMP]: {
      top: 760,
      left: 422,
      width: 10,
      height: 10,
    },
    [MERRY_MEN]: {
      top: 722,
      left: 481,
      width: 10,
      height: 10,
    },
    [CARRIAGE]: {
      top: 814,
      left: 604,
      width: 50,
      height: 50,
    },
  },
  [SOUTHWELL_FOREST]: {
    [HENCHMEN]: {
      top: 918,
      left: 688,
      width: 10,
      height: 10,
    },
    [CAMP]: {
      top: 1192,
      left: 680,
      width: 10,
      height: 10,
    },
    [MERRY_MEN]: {
      top: 1040,
      left: 762,
      width: 100,
      height: 100,
    },
    [CARRIAGE]: {
      top: 984,
      left: 801,
      width: 10,
      height: 10,
    },
  },
  [TUXFORD]: {
    [HENCHMEN]: {
      top: 514,
      left: 894,
      width: 100,
      height: 161,
    },
    [CAMP]: {
      top: 780,
      left: 991,
      width: 50,
      height: 50,
    },
    [MERRY_MEN]: {
      top: 800,
      left: 890,
      width: 100,
      height: 161,
    },
    [CARRIAGE]: {
      top: 695,
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
    id: 'initiativeTrack_singlePlot_select',
    top: 1589,
    left: 1088,
    extraClasses: 'gest_marker_space gest_initiative_track gest_initiative_track_select',
  },
  {
    id: 'initiativeTrack_event_select',
    top: 1581,
    left: 1184,
    extraClasses: 'gest_marker_space gest_initiative_track gest_initiative_track_select',
  },
  {
    id: 'initiativeTrack_plotsAndDeeds_select',
    top: 1573,
    left: 1281,
    extraClasses: 'gest_marker_space gest_initiative_track gest_initiative_track_select',
  },
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
    top: 521,
    left: 265,
  },
  {
    id: `${MERRY_MEN}_prison`,
    top: 167,
    left: 1230,
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
    id: NEWARK_SOUTHWELL_FOREST_BORDER,
    top: 1060,
    left: 867,
    extraClasses: 'gest_bridge_location',
  },
  {
    id: NOTTINGHAM_REMSTON_BORDER,
    top: 1246,
    left: 537,
    extraClasses: 'gest_bridge_location',
  },
];
