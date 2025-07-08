
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, FileText, Upload, Download } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Extend jsPDF interface for autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => void;
  }
}

const Index = () => {
  const [formData, setFormData] = useState({
    department: '',
    date: new Date(),
    location: '',
    activities: '',
    outputType: '',
    outputLength: '',
    outputWidth: '',
    outputDepth: '',
    vehicleType: '',
    tripCount: '',
    tools: '',
    comments: '',
    pictures: []
  });

  const departments = [
    'Drainage',
    'Sweeping', 
    'Landscaping',
    'Market Cleaning',
    'Loaders'
  ];

  const commonActivities = {
    'Drainage': ['Garbage Collection', 'Desilting', 'Loading away silt', 'Channel Clearing'],
    'Sweeping': ['Street Sweeping', 'Pavement Cleaning', 'Debris Collection'],
    'Landscaping': ['Grass Cutting', 'Tree Pruning', 'Planting', 'Weeding'],
    'Market Cleaning': ['Floor Cleaning', 'Waste Collection', 'Sanitization'],
    'Loaders': ['Material Loading', 'Waste Transportation', 'Equipment Moving']
  };

  const commonTools = {
    'Drainage': ['Spades', 'Fork hoes', 'Hand hoes', 'Wheelbarrows', 'Shovels'],
    'Sweeping': ['Brooms', 'Dustpans', 'Wheelbarrows', 'Trash bags'],
    'Landscaping': ['Lawn mowers', 'Pruning shears', 'Rakes', 'Watering cans'],
    'Market Cleaning': ['Mops', 'Buckets', 'Disinfectants', 'Cleaning cloths'],
    'Loaders': ['Trucks', 'Tractors', 'Loading equipment', 'Safety gear']
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    setFormData(prev => ({
      ...prev,
      pictures: [...prev.pictures, ...files]
    }));
  };

  const generatePDF = () => {
    if (!formData.department || !formData.location || !formData.activities) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields: department, location, and activities.",
        variant: "destructive"
      });
      return;
    }

    const doc = new jsPDF('landscape');
    
    // Add logo (placeholder for now - you can replace with actual logo)
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('7HILLS', 20, 25);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Clean streets, Green City', 20, 32);

    // Title
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(`${formData.department.toUpperCase()} DIVISION WEEKLY WORK-PLAN AND REPORT`, 20, 50);
    doc.text(`(WEEK: ${format(formData.date, 'MMM dd-dd')})`, 20, 60);

    // Prepare table data
    const tableData = [];
    let output = '';
    
    if (formData.outputType === 'area') {
      output = `${formData.outputLength}m×${formData.outputWidth}m`;
    } else if (formData.outputType === 'volume') {
      output = `${formData.outputLength}m×${formData.outputWidth}m×${formData.outputDepth}m`;
    } else if (formData.outputType === 'trips') {
      output = `${formData.tripCount} trips (${formData.vehicleType})`;
    }

    tableData.push([
      format(formData.date, 'dd.MM'),
      formData.location,
      formData.activities,
      output,
      formData.tools,
      formData.comments,
      'See attached'
    ]);

    // Create table
    doc.autoTable({
      head: [['Day', 'Date', 'Location', 'Activities', 'Output', 'Tools', 'Comments', 'Pictures']],
      body: tableData,
      startY: 75,
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [255, 193, 7],
        textColor: [0, 0, 0],
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 25 },
        2: { cellWidth: 40 },
        3: { cellWidth: 50 },
        4: { cellWidth: 40 },
        5: { cellWidth: 40 },
        6: { cellWidth: 50 },
        7: { cellWidth: 30 }
      }
    });

    // Save the PDF
    doc.save(`${formData.department}_Work_Plan_${format(formData.date, 'yyyy-MM-dd')}.pdf`);
    
    toast({
      title: "PDF Generated Successfully",
      description: "Your work plan report has been downloaded.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-orange-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="text-4xl font-bold text-orange-500">7</div>
            <div className="text-2xl font-bold text-green-600">Hills</div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Work Plan Generator</h1>
          <p className="text-gray-600">Clean streets, Green City</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-600 to-orange-500 text-white">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-6 h-6" />
              Generate Work Plan Report
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Department Selection */}
              <div className="space-y-2">
                <Label htmlFor="department">Department *</Label>
                <Select value={formData.department} onValueChange={(value) => handleInputChange('department', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map(dept => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Selection */}
              <div className="space-y-2">
                <Label>Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.date ? format(formData.date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.date}
                      onSelect={(date) => handleInputChange('date', date)}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Enter work location"
                />
              </div>

              {/* Activities */}
              <div className="space-y-2">
                <Label htmlFor="activities">Activities *</Label>
                <Select value={formData.activities} onValueChange={(value) => handleInputChange('activities', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select activity" />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.department && commonActivities[formData.department]?.map(activity => (
                      <SelectItem key={activity} value={activity}>{activity}</SelectItem>
                    ))}
                    <SelectItem value="custom">Custom Activity</SelectItem>
                  </SelectContent>
                </Select>
                {formData.activities === 'custom' && (
                  <Input
                    placeholder="Enter custom activity"
                    onChange={(e) => handleInputChange('activities', e.target.value)}
                  />
                )}
              </div>

              {/* Output Type */}
              <div className="space-y-2">
                <Label htmlFor="outputType">Output Type</Label>
                <Select value={formData.outputType} onValueChange={(value) => handleInputChange('outputType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select output type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="area">Area (Length × Width)</SelectItem>
                    <SelectItem value="volume">Volume (Length × Width × Depth)</SelectItem>
                    <SelectItem value="trips">Number of Trips</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Dynamic Output Fields */}
              {formData.outputType === 'area' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="length">Length (m)</Label>
                    <Input
                      id="length"
                      type="number"
                      value={formData.outputLength}
                      onChange={(e) => handleInputChange('outputLength', e.target.value)}
                      placeholder="Enter length"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="width">Width (m)</Label>
                    <Input
                      id="width"
                      type="number"
                      value={formData.outputWidth}
                      onChange={(e) => handleInputChange('outputWidth', e.target.value)}
                      placeholder="Enter width"
                    />
                  </div>
                </>
              )}

              {formData.outputType === 'volume' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="length">Length (m)</Label>
                    <Input
                      id="length"
                      type="number"
                      value={formData.outputLength}
                      onChange={(e) => handleInputChange('outputLength', e.target.value)}
                      placeholder="Enter length"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="width">Width (m)</Label>
                    <Input
                      id="width"
                      type="number"
                      value={formData.outputWidth}
                      onChange={(e) => handleInputChange('outputWidth', e.target.value)}
                      placeholder="Enter width"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="depth">Depth/Height (m)</Label>
                    <Input
                      id="depth"
                      type="number"
                      value={formData.outputDepth}
                      onChange={(e) => handleInputChange('outputDepth', e.target.value)}
                      placeholder="Enter depth/height"
                    />
                  </div>
                </>
              )}

              {formData.outputType === 'trips' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="vehicleType">Vehicle Type</Label>
                    <Select value={formData.vehicleType} onValueChange={(value) => handleInputChange('vehicleType', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select vehicle" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="truck">Truck</SelectItem>
                        <SelectItem value="tractor">Tractor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tripCount">Number of Trips</Label>
                    <Input
                      id="tripCount"
                      type="number"
                      value={formData.tripCount}
                      onChange={(e) => handleInputChange('tripCount', e.target.value)}
                      placeholder="Enter number of trips"
                    />
                  </div>
                </>
              )}

              {/* Tools */}
              <div className="space-y-2">
                <Label htmlFor="tools">Tools Used</Label>
                <Select value={formData.tools} onValueChange={(value) => handleInputChange('tools', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select tools" />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.department && commonTools[formData.department]?.map(tool => (
                      <SelectItem key={tool} value={tool}>{tool}</SelectItem>
                    ))}
                    <SelectItem value="custom">Custom Tools</SelectItem>
                  </SelectContent>
                </Select>
                {formData.tools === 'custom' && (
                  <Input
                    placeholder="Enter custom tools"
                    onChange={(e) => handleInputChange('tools', e.target.value)}
                  />
                )}
              </div>
            </div>

            {/* Comments */}
            <div className="space-y-2">
              <Label htmlFor="comments">Comments</Label>
              <Textarea
                id="comments"
                value={formData.comments}
                onChange={(e) => handleInputChange('comments', e.target.value)}
                placeholder="Enter any additional comments"
                rows={3}
              />
            </div>

            {/* Picture Upload */}
            <div className="space-y-2">
              <Label htmlFor="pictures">Upload Pictures</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <input
                  type="file"
                  id="pictures"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label htmlFor="pictures" className="cursor-pointer text-blue-600 hover:text-blue-800">
                  Click to upload pictures
                </label>
                <p className="text-sm text-gray-500 mt-1">or drag and drop</p>
                {formData.pictures.length > 0 && (
                  <p className="text-sm text-green-600 mt-2">
                    {formData.pictures.length} file(s) selected
                  </p>
                )}
              </div>
            </div>

            {/* Generate PDF Button */}
            <div className="flex justify-center pt-4">
              <Button 
                onClick={generatePDF}
                className="bg-gradient-to-r from-green-600 to-orange-500 hover:from-green-700 hover:to-orange-600 text-white px-8 py-3 text-lg"
              >
                <Download className="w-5 h-5 mr-2" />
                Generate PDF Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
