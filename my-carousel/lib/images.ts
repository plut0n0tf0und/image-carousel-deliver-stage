export interface ImageItem {
  id: number;
  url: string;
  caption: string;
  description: string;
}

export const images: ImageItem[] = [
  {
    id: 1,
    url: "/home.png.png",
    caption: "Home",
    description: "Access and manage dashboard projects",
  },
  {
    id: 2,
    url: "/dashboard.jpeg",
    caption: "Dashboard Overview",
    description: "View charts and layout",
  },
  {
    id: 3,
    url: "/stepper.png.jpeg",
    caption: "Chart Creation Flow",
    description: "Step-by-step chart setup",
  },
  {
    id: 4,
    url: "/add-data-source.jpeg",
    caption: "Add Data Source",
    description: "Connect API and preview data",
  },
  {
    id: 5,
    url: "/chart-type.jpeg",
    caption: "Chart Type Selection",
    description: "Select chart type",
  },
  {
    id: 6,
    url: "/mapping.jpeg",
    caption: "Data Mapping",
    description: "Map data to chart",
  },
  {
    id: 7,
    url: "/chart-name.jpeg",
    caption: "Chart Setup",
    description: "Name and save chart",
  },
  {
    id: 8,
    url: "/dashboard-charts.jpeg",
    caption: "Dashboard with Charts",
    description: "View all created charts",
  },
  {
    id: 9,
    url: "/three-dot-options.jpeg",
    caption: "Chart Actions",
    description: "Edit Mapping, rename, or delete charts",
  },
];
