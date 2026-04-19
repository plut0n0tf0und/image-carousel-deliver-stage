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
    caption: "Home Page",
    description: "Main landing view with navigation and hero section",
  },
  {
    id: 2,
    url: "/dashboard.jpeg",
    caption: "Dashboard Page",
    description: "Overview dashboard with key metrics and widgets",
  },
  {
    id: 3,
    url: "/stepper.png.jpeg",
    caption: "Stepper Page",
    description: "Step-by-step wizard for guided user flows",
  },
  {
    id: 4,
    url: "/add-data-source.jpeg",
    caption: "Add Data Source",
    description: "Accordion panel for connecting data sources",
  },
  {
    id: 5,
    url: "/chart-type.jpeg",
    caption: "Chart Type Selector",
    description: "Visual chart type selection interface",
  },
  {
    id: 6,
    url: "/mapping.jpeg",
    caption: "Mapping Accordion",
    description: "Field mapping configuration panel",
  },
  {
    id: 7,
    url: "/chart-name.jpeg",
    caption: "Chart Name Accordion",
    description: "Naming and saving chart configurations",
  },
  {
    id: 8,
    url: "/dashboard-charts.jpeg",
    caption: "Dashboard with Charts",
    description: "Final dashboard displaying all configured charts",
  },
  {
    id: 9,
    url: "/three-dot-options.jpeg",
    caption: "Three-Dot Options",
    description: "Chart actions menu with edit, duplicate and delete options",
  },
];
