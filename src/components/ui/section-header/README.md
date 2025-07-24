# SectionHeader Component

A reusable component that provides a standardized header section with search, filter, and action button functionality.

## Features

- **Search Bar**: Configurable search input with placeholder text
- **Custom Filter Component**: Parent page controls the filter UI completely
- **Action Button**: Primary action button (e.g., "Add Client", "Add Service")
- **Responsive Design**: Adapts to different screen sizes
- **Customizable Styling**: Supports custom CSS classes for different use cases

## Props

| Prop                    | Type                      | Required | Default     | Description                                 |
| ----------------------- | ------------------------- | -------- | ----------- | ------------------------------------------- |
| `title`                 | `string`                  | ✅       | -           | The section title                           |
| `searchValue`           | `string`                  | ✅       | -           | Current search input value                  |
| `onSearchChange`        | `(value: string) => void` | ✅       | -           | Callback for search input changes           |
| `searchPlaceholder`     | `string`                  | ❌       | "Search..." | Placeholder text for search input           |
| `actionButtonTitle`     | `string`                  | ✅       | -           | Text for the action button                  |
| `onActionButtonClick`   | `() => void`              | ✅       | -           | Callback for action button click            |
| `filterComponent`       | `React.ReactNode`         | ❌       | -           | Custom filter component (parent controlled) |
| `className`             | `string`                  | ❌       | -           | Custom CSS class for the container          |
| `searchBarClassName`    | `string`                  | ❌       | -           | Custom CSS class for the search bar         |
| `actionButtonClassName` | `string`                  | ❌       | -           | Custom CSS class for the action button      |

## Usage Examples

### Basic Usage (No Filters)

```tsx
import SectionHeader from "@/components/ui/section-header";

<SectionHeader
  title="Clients"
  searchValue={searchValue}
  onSearchChange={setSearchValue}
  searchPlaceholder="Search clients..."
  actionButtonTitle="Add Client"
  onActionButtonClick={() => setShowModal(true)}
/>;
```

### With Custom Filter Component

```tsx
import SectionHeader from "@/components/ui/section-header";
import PopOver from "@/components/ui/popover";
import TableFilter from "@/components/ui/table-filter";
import Image from "next/image";
import { filterIcon } from "@/resources/images";

const [showFilter, setShowFilter] = useState<boolean>(false);
const filterRef = useRef<HTMLDivElement>(null);
const [selectedFilter, setSelectedFilter] = useState<string>("Active");

<SectionHeader
  title="Clients"
  searchValue={searchValue}
  onSearchChange={setSearchValue}
  searchPlaceholder="Search clients..."
  actionButtonTitle="Add Client"
  onActionButtonClick={() => setShowModal(true)}
  filterComponent={
    <div ref={filterRef} onClick={() => setShowFilter(true)}>
      <Image src={filterIcon} alt="filter" width={24} height={24} />
    </div>
  }
/>

<PopOver
  reference={filterRef}
  show={showFilter}
  onClose={() => setShowFilter(false)}
>
  <TableFilter
    title="Filters"
    options={["Active", "Inactive"]}
    selectedOptions={selectedFilter}
    onOptionsChange={(option) => {
      setSelectedFilter(option);
      setShowFilter(false);
    }}
  />
</PopOver>
```

### Different Filter UI for Different Pages

```tsx
// Page 1: Simple dropdown filter
<SectionHeader
  title="Services"
  searchValue={searchValue}
  onSearchChange={setSearchValue}
  actionButtonTitle="Add Service"
  onActionButtonClick={() => setShowModal(true)}
  filterComponent={
    <select value={selectedFilter} onChange={(e) => setSelectedFilter(e.target.value)}>
      <option value="">All Categories</option>
      <option value="plumbing">Plumbing</option>
      <option value="electrical">Electrical</option>
    </select>
  }
/>

// Page 2: Custom filter with multiple options
<SectionHeader
  title="Properties"
  searchValue={searchValue}
  onSearchChange={setSearchValue}
  actionButtonTitle="Add Property"
  onActionButtonClick={() => setShowModal(true)}
  filterComponent={
    <div className="custom-filter">
      <button onClick={() => setFilterType("active")}>Active</button>
      <button onClick={() => setFilterType("inactive")}>Inactive</button>
      <button onClick={() => setFilterType("pending")}>Pending</button>
    </div>
  }
/>
```

## Implementation Details

- The component is purely presentational - no internal state management
- Filter UI is completely controlled by the parent page
- The search bar and action button are always rendered
- All styling is modular and can be customized via CSS classes
- The component is fully responsive and follows the design system

## Parent Page Integration

The parent page should manage all state and UI logic:

- Search value
- Filter state and UI
- Action button click handlers
- Filter dropdown/popover logic

Example state management:

```tsx
const [searchValue, setSearchValue] = useState<string>("");
const [selectedFilter, setSelectedFilter] = useState<string>("Active");
const [showFilter, setShowFilter] = useState<boolean>(false);
const filterRef = useRef<HTMLDivElement>(null);
```
