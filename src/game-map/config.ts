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
      top: 1271,
      left: 737,
      width: 89,
      height: 143,
    },
    [CAMP]: {
      top: 1219,
      left: 869,
      width: 50,
      height: 50,
    },
    [MERRY_MEN]: {
      top: 1255,
      left: 931,
      width: 82,
      height: 170,
    },
    [CARRIAGE]: {
      top: 1419,
      left: 805,
      width: 100,
      height: 50,
    }
  },
  [BLYTH]: {
    [HENCHMEN]: {
      top: 583,
      left: 641,
      width: 100,
      height: 160,
    },
    [CAMP]: {
      top: 488,
      left: 585,
      width: 50,
      height: 50,
    },
    [MERRY_MEN]: {
      top: 562,
      left: 525,
      width: 100,
      height: 160,
    },
    [CARRIAGE]: {
      top: 500,
      left: 772,
      width: 50,
      height: 100,
    }
  },
  [MANSFIELD]: {
    [HENCHMEN]: {
      top: 1128,
      left: 313,
      width: 100,
      height: 150,
    },
    [CAMP]: {
      top: 855,
      left: 273,
      width: 50,
      height: 50,
    },
    [MERRY_MEN]: {
      top: 847,
      left: 329,
      width: 100,
      height: 145,
    },
    [CARRIAGE]: {
      top: 1028,
      left: 253,
      width: 50,
      height: 100,
    }
  },
  [NEWARK]: {
    [HENCHMEN]: {
      top: 706,
      left: 1081,
      width: 100,
      height: 145,
    },
    [CAMP]: {
      top: 1108,
      left: 916,
      width: 50,
      height: 50,
    },
    [MERRY_MEN]: {
      top: 1035,
      left: 977,
      width: 100,
      height: 170,
    },
    [CARRIAGE]: {
      top: 650,
      left: 1136,
      width: 100,
      height: 50,
    }
  },
  [NOTTINGHAM]: {
    [HENCHMEN]: {
      top: 1131,
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
      top: 1047,
      left: 474,
      width: 170,
      height: 79,
    },
    [CARRIAGE]: {
      top: 1108,
      left: 634,
      width: 50,
      height: 100,
    }
  },
  [OLLERTON_HILL]: {
    // [HENCHMEN]: {
    //   top: 922,
    //   left: 112,
    //   width: 100,
    //   height: 100,
    // },
    [CAMP]: {
      top: 880,
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
      top: 1401,
      left: 624,
      width: 100,
      height: 160,
    },
    [CAMP]: {
      top: 1318,
      left: 507,
      width: 50,
      height: 50,
    },
    [MERRY_MEN]: {
      top: 1373,
      left: 416,
      width: 100,
      height: 160,
    },
    [CARRIAGE]: {
      top: 1537,
      left: 511,
      width: 100,
      height: 50,
    }
  },
  [RETFORD]: {
    [HENCHMEN]: {
      top: 335,
      left: 971,
      width: 100,
      height: 143,
    },
    [CAMP]: {
      top: 262,
      left: 766,
      width: 50,
      height: 50,
    },
    [MERRY_MEN]: {
      top: 335,
      left: 866,
      width: 100,
      height: 143,
    },
    [CARRIAGE]: {
      top: 227,
      left: 989,
      width: 50,
      height: 100,
    }
  },
  [SHIRE_WOOD]: {
    [HENCHMEN]: {
      top: 787,
      left: 467,
      width: 160,
      height: 68,
    },
    [CAMP]: {
      top: 924,
      left: 610,
      width: 50,
      height: 50,
    },
    [MERRY_MEN]: {
      top: 904,
      left: 467,
      width: 140,
      height: 100,
    },
    [CARRIAGE]: {
      top: 855,
      left: 467,
      width: 50,
      height: 50,
    }
  },
  [SOUTHWELL_FOREST]: {
    [HENCHMEN]: {
      top: 955,
      left: 671,
      width: 84,
      height: 124,
    },
    [CAMP]: {
      top: 1153,
      left: 762,
      width: 50,
      height: 50,
    },
    [MERRY_MEN]: {
      top: 1005,
      left: 762,
      width: 100,
      height: 100,
    },
    [CARRIAGE]: {
      top: 949,
      left: 771,
      width: 50,
      height: 50,
    }
  },
  [TUXFORD]: {
    [HENCHMEN]: {
      top: 832,
      left: 864,
      width: 100,
      height: 161,
    },
    [CAMP]: {
      top: 645,
      left: 864,
      width: 50,
      height: 50,
    },
    [MERRY_MEN]: {
      top: 532,
      left: 932,
      width: 100,
      height: 161,
    },
    [CARRIAGE]: {
      top: 724,
      left: 823,
      width: 50,
      height: 100,
    }
  },
};

const JUSTICE_TRACK_CONFIG: TrackConfig[] = [
  {
    id: 'justiceTrack_1',
    top: 922,
    left: 112,
    extraClasses: 'gest_marker_space gest_justice_order_track',
  },
  {
    id: 'justiceTrack_2',
    top: 821,
    left: 112,
    extraClasses: 'gest_marker_space gest_justice_order_track',
  },
  {
    id: 'justiceTrack_3',
    top: 720,
    left: 112,
    extraClasses: 'gest_marker_space gest_justice_order_track',
  },
  {
    id: 'justiceTrack_4',
    top: 619,
    left: 112,
    extraClasses: 'gest_marker_space gest_justice_order_track',
  },
  {
    id: 'justiceTrack_5',
    top: 518,
    left: 112,
    extraClasses: 'gest_marker_space gest_justice_order_track',
  },
  {
    id: 'justiceTrack_6',
    top: 417,
    left: 112,
    extraClasses: 'gest_marker_space gest_justice_order_track',
  },
  {
    id: 'justiceTrack_7',
    top: 316,
    left: 112,
    extraClasses: 'gest_marker_space gest_justice_order_track',
  },
];

const ORDER_TRACK: TrackConfig[] = [
  {
    id: 'orderTrack_1',
    top: 1047,
    left: 112,
    extraClasses: 'gest_marker_space gest_justice_order_track',
  },
  {
    id: 'orderTrack_2',
    top: 1148,
    left: 112,
    extraClasses: 'gest_marker_space gest_justice_order_track',
  },
  {
    id: 'orderTrack_3',
    top: 1249,
    left: 112,
    extraClasses: 'gest_marker_space gest_justice_order_track',
  },
  {
    id: 'orderTrack_4',
    top: 1350,
    left: 112,
    extraClasses: 'gest_marker_space gest_justice_order_track',
  },
  {
    id: 'orderTrack_5',
    top: 1451,
    left: 112,
    extraClasses: 'gest_marker_space gest_justice_order_track',
  },
  {
    id: 'orderTrack_6',
    top: 1552,
    left: 112,
    extraClasses: 'gest_marker_space gest_justice_order_track',
  },
  {
    id: 'orderTrack_7',
    top: 1653,
    left: 112,
    extraClasses: 'gest_marker_space gest_justice_order_track',
  },
];

const ROYAL_INSPECTION_TRACK: TrackConfig[] = [
  {
    id: 'royalInspectionTrack_unrest',
    top: 880,
    left: 1211,
    extraClasses: 'gest_marker_space gest_royal_inspection_track',
  },
  {
    id: 'royalInspectionTrack_mischief',
    top: 974,
    left: 1211,
    extraClasses: 'gest_marker_space gest_royal_inspection_track',
  },
  {
    id: 'royalInspectionTrack_governance',
    top: 1065,
    left: 1211,
    extraClasses: 'gest_marker_space gest_royal_inspection_track',
  },
  {
    id: 'royalInspectionTrack_redeployment',
    top: 1156,
    left: 1211,
    extraClasses: 'gest_marker_space gest_royal_inspection_track',
  },
  {
    id: 'royalInspectionTrack_reset',
    top: 1246,
    left: 1211,
    extraClasses: 'gest_marker_space gest_royal_inspection_track',
  },
  {
    id: 'royalInspectionTrack_balad',
    top: 728,
    left: 1233,
    extraClasses: 'gest_marker_space gest_royal_inspection_track',
  },
];

const PARISH_STATUS_BOXES: TrackConfig[] = [
  {
    id: 'parishStatusBox_Retford',
    top: 222,
    left: 883,
    extraClasses: 'gest_parish_status_box',
  },
  {
    id: 'parishStatusBox_Blyth',
    top: 461,
    left: 669,
    extraClasses: 'gest_parish_status_box',
  },
  {
    id: 'parishStatusBox_Tuxford',
    top: 716,
    left: 890,
    extraClasses: 'gest_parish_status_box',
  },
  {
    id: 'parishStatusBox_Newark',
    top: 904,
    left: 1060,
    extraClasses: 'gest_parish_status_box',
  },
  {
    id: 'parishStatusBox_Mansfield',
    top: 1004,
    left: 311,
    extraClasses: 'gest_parish_status_box',
  },
  {
    id: 'parishStatusBox_Bingham',
    top: 1294,
    left: 834,
    extraClasses: 'gest_parish_status_box',
  },
  {
    id: 'parishStatusBox_Remston',
    top: 1399,
    left: 528,
    extraClasses: 'gest_parish_status_box',
  },
];

const INITIATIVE_TRACK: TrackConfig[] = [
  {
    id: 'initiativeTrack_singlePlot',
    top: 1614,
    left: 1094,
    extraClasses: 'gest_marker_space gest_initiative_track',
  },
  {
    id: 'initiativeTrack_event',
    top: 1606,
    left: 1191,
    extraClasses: 'gest_marker_space gest_initiative_track',
  },
  {
    id: 'initiativeTrack_plotsAndDeeds',
    top: 1598,
    left: 1286,
    extraClasses: 'gest_marker_space gest_initiative_track',
  },
  {
    id: 'initiativeTrack_firstEligible',
    top: 1803,
    left: 1146,
    extraClasses: 'gest_marker_space gest_initiative_track',
  },
  {
    id: 'initiativeTrack_secondEligible',
    top: 1791,
    left: 1269,
    extraClasses: 'gest_marker_space gest_initiative_track',
  },
];

const UNIQUE_SPACES: TrackConfig[] = [
  {
    id: 'carriage_usedCarriages',
    top: 523,
    left: 249,
  },
  {
    id: 'prison',
    top: 165,
    left: 1182,
  },
];
