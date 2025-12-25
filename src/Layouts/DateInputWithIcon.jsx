import { CalendarIcon } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Input } from "../components/ui/input";

const DateInputWithIcon = ({ name, value, onChange }) => {
  // Ensure value is a Date object or null
  const selectedDate = value ? (value instanceof Date ? value : new Date(value)) : null;

  return (
    <div className="relative w-full max-w-sm">
      <DatePicker
        selected={selectedDate}
        onChange={(date) => {
          if (onChange) {
            onChange({ target: { name, value: date } });
          }
        }}
        showMonthDropdown
        showYearDropdown
        dropdownMode="select"
        todayButton="Today"
        customInput={
          <div className="relative w-full">
            <Input
              readOnly
              value={selectedDate ? selectedDate.toLocaleDateString() : ""}
              className="w-full border rounded px-3 py-2 pr-10 cursor-pointer"
              placeholder="Select date"
            />
            <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground cursor-pointer" />
          </div>
        }
      />
    </div>
  );
};

export default DateInputWithIcon;
