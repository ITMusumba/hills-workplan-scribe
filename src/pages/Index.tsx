"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  CalendarIcon,
  FileText,
  Upload,
  Download,
  AlertCircle,
} from "lucide-react";
import { format, startOfWeek, addDays, getYear } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
const Index = () => {
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [division, setDivision] = useState("");
  const [department, setDepartment] = useState("");
  const [weekData, setWeekData] = useState(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      days.push({
        location: "",
        activities: "",
        customActivity: "",
        outputType: "",
        outputLength: "",
        outputWidth: "",
        outputDepth: "",
        vehicleType: "",
        tripCount: "",
        tools: "",
        customTools: "",
        comments: "",
      });
    }
    return days;
  });
  const getWeekDays = () => {
    const sunday = startOfWeek(selectedWeek, {
      weekStartsOn: 0,
    });
    return Array.from(
      {
        length: 7,
      },
      (_, i) => addDays(sunday, i)
    );
  };
  const getWeekInfo = () => {
    const days = getWeekDays();
    const startDate = days[0];
    const endDate = days[6];
    const year = getYear(startDate);
    const month = format(startDate, "MMMM");
    const dateRange = `${format(startDate, "dd")}-${format(endDate, "dd")}`;
    return {
      year,
      month,
      dateRange,
      days,
    };
  };
  const divisions = [
    "Kawempe",
    "Kampala Central",
    "Rubaga",
    "Makindye",
    "Nakawa",
  ];
  const departments = [
    "Drainage",
    "Sweeping",
    "Landscaping",
    "Market Cleaning",
    "Loaders",
  ];
  const commonActivities = {
    Drainage: [
      "Garbage Collection",
      "Desilting",
      "Loading away silt",
      "Channel Clearing",
    ],
    Sweeping: ["Street Sweeping", "Pavement Cleaning", "Debris Collection"],
    Landscaping: ["Grass Cutting", "Tree Pruning", "Planting", "Weeding"],
    "Market Cleaning": ["Floor Cleaning", "Waste Collection", "Sanitization"],
    Loaders: ["Material Loading", "Waste Transportation", "Equipment Moving"],
  };
  const commonTools = {
    Drainage: ["Spades", "Fork hoes", "Hand hoes", "Wheelbarrows", "Shovels"],
    Sweeping: ["Brooms", "Dustpans", "Wheelbarrows", "Trash bags"],
    Landscaping: ["Lawn mowers", "Pruning shears", "Rakes", "Watering cans"],
    "Market Cleaning": ["Mops", "Buckets", "Disinfectants", "Cleaning cloths"],
    Loaders: ["Trucks", "Tractors", "Loading equipment", "Safety gear"],
  };
  const handleDayDataChange = (dayIndex, field, value) => {
    setWeekData((prev) => {
      const newData = [...prev];
      newData[dayIndex] = {
        ...newData[dayIndex],
        [field]: value,
      };
      return newData;
    });
  };
  const generatePDFDocument = () => {
    if (!division || !department) {
      toast({
        title: "Missing Information",
        description: "Please select both division and department.",
        variant: "destructive",
      });
      return;
    }
    const { year, month, dateRange, days } = getWeekInfo();
    const filledDays = weekData.filter(
      (day) => day.location && (day.activities || day.customActivity)
    ).length;
    if (filledDays === 0) {
      toast({
        title: "No Data Entered",
        description: "Please enter data for at least one day of the week.",
        variant: "destructive",
      });
      return;
    }

    // Create new PDF document
    const doc = new jsPDF("landscape", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Log page dimensions for debugging
    console.log(`PDF Page Width: ${pageWidth}mm, Height: ${pageHeight}mm`);

    // Add header
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("7HILLS", 20, 20);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Clean streets, Green City", 20, 28);

    // Add title
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    const title = `${division.toUpperCase()}: ${department.toUpperCase()} UNIT / WEEKLY WORK-PLAN AND REPORT`;
    const titleWidth = doc.getTextWidth(title);
    doc.text(title, (pageWidth - titleWidth) / 2, 45);
    doc.setFontSize(12);
    const subtitle = `YEAR: ${year} | MONTH: ${month} | WEEK: ${dateRange}`;
    const subtitleWidth = doc.getTextWidth(subtitle);
    doc.text(subtitle, (pageWidth - subtitleWidth) / 2, 55);

    // Table configuration
    const startX = 15;
    const startY = 70;
    const rowHeight = 15;
    const headerHeight = 20;

    // Column widths (total should equal pageWidth - 30 for margins)
    const totalWidth = pageWidth - 30; // 30mm for margins (15mm on each side)
    const columnWidths = [
      Math.floor(totalWidth * 0.09),
      // Day (9%)
      Math.floor(totalWidth * 0.08),
      // Date (8%)
      Math.floor(totalWidth * 0.13),
      // Location (13%)
      Math.floor(totalWidth * 0.17),
      // Activities (17%)
      Math.floor(totalWidth * 0.13),
      // Output (13%)
      Math.floor(totalWidth * 0.13),
      // Tools (13%)
      Math.floor(totalWidth * 0.17),
      // Comments (17%)
      Math.floor(totalWidth * 0.1), // Pictures (10%)
    ];
    const headers = [
      "Day",
      "Date",
      "Location",
      "Activities",
      "Output",
      "Tools",
      "Comment & Sign",
      "Pictures",
    ];

    // Function to draw table borders
    const drawTableBorders = (x, y, width, height) => {
      doc.rect(x, y, width, height);
    };

    // Function to wrap text
    const wrapText = (text, maxWidth) => {
      const words = text.split(" ");
      const lines = [];
      let currentLine = "";
      words.forEach((word) => {
        const testLine = currentLine + (currentLine ? " " : "") + word;
        const testWidth = doc.getTextWidth(testLine);
        if (testWidth > maxWidth && currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      });
      if (currentLine) {
        lines.push(currentLine);
      }
      return lines;
    };

    // Draw header row
    let currentX = startX;
    doc.setFillColor(76, 175, 80); // Green background
    doc.setTextColor(255, 255, 255); // White text
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);

    // Calculate actual table width (sum of all column widths)
    const actualTableWidth = columnWidths.reduce(
      (sum, width) => sum + width,
      0
    );

    // Draw header background
    doc.rect(startX, startY, actualTableWidth, headerHeight, "F");

    // Draw header borders and text
    headers.forEach((header, index) => {
      drawTableBorders(currentX, startY, columnWidths[index], headerHeight);

      // Center text in header
      const textWidth = doc.getTextWidth(header);
      const textX = currentX + (columnWidths[index] - textWidth) / 2;
      const textY = startY + headerHeight / 2 + 2;
      doc.text(header, textX, textY);
      currentX += columnWidths[index];
    });

    // Reset text color for data rows
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);

    // Draw data rows
    days.forEach((day, index) => {
      const dayData = weekData[index];
      const rowY = startY + headerHeight + index * rowHeight;

      // Prepare row data
      let output = "";
      if (
        dayData.outputType === "area" &&
        dayData.outputLength &&
        dayData.outputWidth
      ) {
        output = `${dayData.outputLength}m×${dayData.outputWidth}m`;
      } else if (
        dayData.outputType === "volume" &&
        dayData.outputLength &&
        dayData.outputWidth &&
        dayData.outputDepth
      ) {
        output = `${dayData.outputLength}m×${dayData.outputWidth}m×${dayData.outputDepth}m`;
      } else if (
        dayData.outputType === "trips" &&
        dayData.tripCount &&
        dayData.vehicleType
      ) {
        output = `${dayData.tripCount} trips (${dayData.vehicleType})`;
      }
      const rowData = [
        format(day, "EEEE"),
        format(day, "dd.MM"),
        dayData.location || "",
        dayData.activities === "custom" ? dayData.customActivity || "" : dayData.activities || "",
        output,
        dayData.tools === "custom" ? dayData.customTools || "" : dayData.tools || "",
        dayData.comments || "",
        "See report",
      ];

      // Alternate row background
      if (index % 2 === 1) {
        doc.setFillColor(245, 245, 245);
        doc.rect(startX, rowY, actualTableWidth, rowHeight, "F");
      }

      // Draw cell borders and text
      currentX = startX;
      rowData.forEach((cellData, cellIndex) => {
        drawTableBorders(currentX, rowY, columnWidths[cellIndex], rowHeight);

        // Wrap text if necessary
        const maxWidth = columnWidths[cellIndex] - 4; // 2mm padding on each side
        const wrappedText = wrapText(cellData, maxWidth);

        // Draw text (only first line if multiple lines)
        if (wrappedText.length > 0) {
          const textX = currentX + 2; // 2mm left padding
          const textY = rowY + 10; // Center vertically
          doc.text(wrappedText[0], textX, textY);

          // If text is wrapped, show truncation indicator
          if (wrappedText.length > 1) {
            const truncatedText = wrappedText[0].slice(0, -3) + "...";
            doc.text(truncatedText, textX, textY);
          }
        }
        currentX += columnWidths[cellIndex];
      });
    });

    // Save the PDF
    const fileName = `${department}_Work_Plan_${year}_${month}_Week_${dateRange}.pdf`;
    doc.save(fileName);
    toast({
      title: "PDF Document Generated Successfully",
      description: "Your work plan report has been downloaded.",
    });
  };
  const { year, month, dateRange, days } = getWeekInfo();
  const filledDays = weekData.filter(
    (day) => day.location && (day.activities || day.customActivity)
  ).length;
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-orange-50">
      {/* Fixed Header with Logo */}
      <div className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-sm shadow-sm z-50 py-3">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <img
              src="/lovable-uploads/cddffb69-e0aa-433e-9cf3-8b09c0b0f5c0.png"
              alt="7Hills Logo"
              className="h-12 sm:h-14 md:h-16 w-auto max-w-full object-contain"
            />
            <div className="text-center flex-1">
              <h1 className="text-2xl font-bold text-gray-800">
                Work Plan Generator
              </h1>
              <p className="text-sm text-gray-600">Clean streets, Green City</p>
            </div>
            <img
              src="/lovable-uploads/46a20213-db30-439c-8685-1a738bc7c739.png"
              alt="Campaign Banner"
              className="h-12 sm:h-14 md:h-16 w-auto max-w-full object-contain"
            />
          </div>
        </div>
      </div>

      {/* Main Content with top padding to account for fixed header */}
      <div className="pt-24 p-4">
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-green-600 to-orange-500 text-white">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-6 h-6" />
                Generate Work Plan Report
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Week Information Display */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-800">
                    Week Information
                  </h3>
                </div>
                <p className="text-blue-700">
                  <strong>Year:</strong> {year} | <strong>Month:</strong>{" "}
                  {month} | <strong>Week Range:</strong> {dateRange}
                </p>
                <p className="text-blue-600 text-sm mt-2">
                  Please fill in data for all 7 days of the week. Currently
                  filled: {filledDays}/7 days
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Division Selection */}
                <div className="space-y-2">
                  <Label htmlFor="division">Division *</Label>
                  <Select value={division} onValueChange={setDivision}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select division" />
                    </SelectTrigger>
                    <SelectContent>
                      {divisions.map((div) => (
                        <SelectItem key={div} value={div}>
                          {div}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Department Selection */}
                <div className="space-y-2">
                  <Label htmlFor="department">Unit *</Label>
                  <Select value={department} onValueChange={setDepartment}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Week Selection */}
                <div className="space-y-2">
                  <Label>Select Week *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !selectedWeek && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedWeek ? (
                          format(selectedWeek, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={selectedWeek}
                        onSelect={(date) => setSelectedWeek(date)}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Daily Data Entry */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Daily Work Plan Data
                </h3>
                {days.map((day, dayIndex) => {
                  const dayData = weekData[dayIndex];
                  const isDayFilled =
                    dayData.location &&
                    (dayData.activities || dayData.customActivity);
                  return (
                    <Card
                      key={dayIndex}
                      className={`border-2 ${
                        isDayFilled
                          ? "border-green-200 bg-green-50"
                          : "border-gray-200"
                      }`}
                    >
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center justify-between">
                          <span>{format(day, "EEEE, MMM dd")}</span>
                          {isDayFilled && (
                            <span className="text-green-600 text-sm">
                              ✓ Complete
                            </span>
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Location */}
                          <div className="space-y-2">
                            <Label>Location *</Label>
                            <Input
                              value={dayData.location}
                              onChange={(e) =>
                                handleDayDataChange(
                                  dayIndex,
                                  "location",
                                  e.target.value
                                )
                              }
                              placeholder="Enter work location"
                            />
                          </div>

                          {/* Activities */}
                          <div className="space-y-2">
                            <Label>Activities *</Label>
                            <Select
                              value={dayData.activities}
                              onValueChange={(value) =>
                                handleDayDataChange(
                                  dayIndex,
                                  "activities",
                                  value
                                )
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select activity" />
                              </SelectTrigger>
                              <SelectContent>
                                {department &&
                                  commonActivities[department]?.map(
                                    (activity) => (
                                      <SelectItem
                                        key={activity}
                                        value={activity}
                                      >
                                        {activity}
                                      </SelectItem>
                                    )
                                  )}
                                <SelectItem value="custom">
                                  Custom Activity
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            {dayData.activities === "custom" && (
                              <Input
                                value={dayData.customActivity}
                                placeholder="Enter custom activity"
                                onChange={(e) =>
                                  handleDayDataChange(
                                    dayIndex,
                                    "customActivity",
                                    e.target.value
                                  )
                                }
                              />
                            )}
                          </div>

                          {/* Output Type */}
                          <div className="space-y-2">
                            <Label>Output Type</Label>
                            <Select
                              value={dayData.outputType}
                              onValueChange={(value) =>
                                handleDayDataChange(
                                  dayIndex,
                                  "outputType",
                                  value
                                )
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select output type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="area">
                                  Area (Length × Width)
                                </SelectItem>
                                <SelectItem value="volume">
                                  Volume (Length × Width × Depth)
                                </SelectItem>
                                <SelectItem value="trips">
                                  Number of Trips
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Dynamic Output Fields */}
                          {dayData.outputType === "area" && (
                            <>
                              <div className="space-y-2">
                                <Label>Length (m)</Label>
                                <Input
                                  type="number"
                                  value={dayData.outputLength}
                                  onChange={(e) =>
                                    handleDayDataChange(
                                      dayIndex,
                                      "outputLength",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Enter length"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Width (m)</Label>
                                <Input
                                  type="number"
                                  value={dayData.outputWidth}
                                  onChange={(e) =>
                                    handleDayDataChange(
                                      dayIndex,
                                      "outputWidth",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Enter width"
                                />
                              </div>
                            </>
                          )}

                          {dayData.outputType === "volume" && (
                            <>
                              <div className="space-y-2">
                                <Label>Length (m)</Label>
                                <Input
                                  type="number"
                                  value={dayData.outputLength}
                                  onChange={(e) =>
                                    handleDayDataChange(
                                      dayIndex,
                                      "outputLength",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Enter length"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Width (m)</Label>
                                <Input
                                  type="number"
                                  value={dayData.outputWidth}
                                  onChange={(e) =>
                                    handleDayDataChange(
                                      dayIndex,
                                      "outputWidth",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Enter width"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Depth/Height (m)</Label>
                                <Input
                                  type="number"
                                  value={dayData.outputDepth}
                                  onChange={(e) =>
                                    handleDayDataChange(
                                      dayIndex,
                                      "outputDepth",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Enter depth/height"
                                />
                              </div>
                            </>
                          )}

                          {dayData.outputType === "trips" && (
                            <>
                              <div className="space-y-2">
                                <Label>Vehicle Type</Label>
                                <Select
                                  value={dayData.vehicleType}
                                  onValueChange={(value) =>
                                    handleDayDataChange(
                                      dayIndex,
                                      "vehicleType",
                                      value
                                    )
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select vehicle" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="truck">Truck</SelectItem>
                                    <SelectItem value="tractor">
                                      Tractor
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label>Number of Trips</Label>
                                <Input
                                  type="number"
                                  value={dayData.tripCount}
                                  onChange={(e) =>
                                    handleDayDataChange(
                                      dayIndex,
                                      "tripCount",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Enter number of trips"
                                />
                              </div>
                            </>
                          )}

                          {/* Tools */}
                          <div className="space-y-2">
                            <Label>Tools Used</Label>
                            <Select
                              value={dayData.tools}
                              onValueChange={(value) =>
                                handleDayDataChange(dayIndex, "tools", value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select tools" />
                              </SelectTrigger>
                              <SelectContent>
                                {department &&
                                  commonTools[department]?.map((tool) => (
                                    <SelectItem key={tool} value={tool}>
                                      {tool}
                                    </SelectItem>
                                  ))}
                                <SelectItem value="custom">
                                  Custom Tools
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            {dayData.tools === "custom" && (
                              <Input
                                value={dayData.customTools}
                                placeholder="Enter custom tools"
                                onChange={(e) =>
                                  handleDayDataChange(
                                    dayIndex,
                                    "customTools",
                                    e.target.value
                                  )
                                }
                              />
                            )}
                          </div>
                        </div>

                        {/* Comments */}
                        <div className="space-y-2">
                          <Label>Comment & Sign</Label>
                          <Textarea
                            value={dayData.comments}
                            onChange={(e) =>
                              handleDayDataChange(
                                dayIndex,
                                "comments",
                                e.target.value
                              )
                            }
                            placeholder="Enter any additional comments"
                            rows={2}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Generate Document Button */}
              <div className="flex justify-center pt-4">
                <Button
                  onClick={generatePDFDocument}
                  className="bg-gradient-to-r from-green-600 to-orange-500 hover:from-green-700 hover:to-orange-600 text-white px-8 py-3 text-lg"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Generate PDF Document
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
export default Index;
