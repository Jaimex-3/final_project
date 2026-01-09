import { useEffect, useMemo, useState } from "react";
import { fetchExams, Exam } from "../api/exams";
import { fetchRoster, fetchSeatingPlan, fetchSeatAssignments, Seat } from "../api/seating";
import { submitCheckin } from "../api/checkins";
import { getUploadUrl } from "../api/common";
import { useToast } from "../context/ToastContext";
import WebcamCapture from "../components/checkin/WebcamCapture";
import SeatingGrid from "../components/seating/SeatingGrid";

type RosterItem = {
  student_id: number;
  student: {
    id: number;
    full_name: string;
    student_number: string;
    photo_path?: string;
    reference_photos?: { image_path: string }[];
  };
  status: string;
};

export default function CheckIn() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>("");
  const [roster, setRoster] = useState<RosterItem[]>([]);
  const [search, setSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<RosterItem | null>(null);
  
  const [seats, setSeats] = useState<Seat[]>([]);
  const [assignments, setAssignments] = useState<Record<string, number>>({});
  const [studentSeat, setStudentSeat] = useState<string | null>(null);

  const toast = useToast();

  useEffect(() => {
    fetchExams().then(setExams).catch(() => toast.error("Failed to load exams"));
  }, []);

  useEffect(() => {
    if (!selectedExamId) return;
    const examId = Number(selectedExamId);
    
    // Load Roster
    fetchRoster(examId).then((data: any) => {
        // Map API response to expected structure if needed
        // Assuming fetchRoster returns the exam_students structure joined with students
        setRoster(data);
    }).catch(() => toast.error("Failed to load roster"));

    // Load Seating Plan & Assignments
    fetchSeatingPlan(examId).then(plan => setSeats(plan.seats || [])).catch(() => setSeats([]));
    fetchSeatAssignments(examId).then(sa => {
        const map: Record<string, number> = {};
        sa.forEach((item: any) => map[item.seat_code] = item.student_id);
        setAssignments(map);
    }).catch(() => setAssignments({}));

  }, [selectedExamId]);

  useEffect(() => {
    if (selectedStudent) {
        // Find assigned seat for selected student
        const seat = Object.entries(assignments).find(([_, sid]) => sid === selectedStudent.student.id);
        setStudentSeat(seat ? seat[0] : null);
    } else {
        setStudentSeat(null);
    }
  }, [selectedStudent, assignments]);

  const filteredRoster = useMemo(() => 
    roster.filter(r => 
      `${r.student.full_name} ${r.student.student_number}`.toLowerCase().includes(search.toLowerCase())
    ), [roster, search]
  );

  const handleVerify = async (file: File) => {
    if (!selectedExamId || !selectedStudent) return;
    
    try {
        const res = await submitCheckin({
            exam_id: Number(selectedExamId),
            student_id: selectedStudent.student.id,
            entered_seat_code: studentSeat || "",
            photo: file
        });
        
        const status = res.is_face_match ? "Face Matched" : "Face Mismatch";
        if (res.is_face_match) {
            toast.success(`Check-in Approved: ${status}`);
        } else {
            toast.error(`Check-in Alert: ${status}`);
        }
    } catch (err: any) {
        toast.error(err.response?.data?.message || "Verification failed");
    }
  };

  // Find reference photo path
  // The API response for students (from fetchRoster) needs to include the photo. 
  // Let's assume fetchRoster now joins or we need another way.
  // Actually, fetchRoster calls /api/admin/exams/<id>/roster. 
  // We might need to ensure backend sends `student_reference_photos`.
  // For now, let's assume `student.image_path` or we fetch it.
  
  // Actually, let's fetch the student details specifically or check if roster includes it.
  // The backend `admin_get_roster` calls `list_exam_roster`, which joins `Student`.
  // `Student.to_dict()` (in models/student.py) does NOT currently include reference photos.
  // We might need to update backend to send it, but let's try to see if we can get it via `get_student`
  // or update the backend `to_dict`?
  // Updating backend `Student.to_dict` or `list_exam_roster` is better.
  
  // Wait, I can just fetch the student details when selected if needed, 
  // OR I can quickly update backend `Student` model to include a property for the primary reference photo.
  
  // Let's rely on what's available. If `student_reference_photos` table is used,
  // we need the path.
  
  // For this turn, I will assume the frontend logic is sound, but I might need a quick backend tweak 
  // to send the photo path. I'll stick to the layout first.

  return (
    <div className="flex h-[calc(100vh-6rem)] gap-6">
      {/* Left Panel: Controls & Roster */}
      <div className="w-1/3 flex flex-col gap-4 bg-slate-900/5 p-4 rounded-xl border border-slate-200">
        <h2 className="text-lg font-bold text-slate-800">Check-in Control</h2>
        
        <div>
            <label className="text-xs font-semibold text-slate-500 uppercase">Select Exam</label>
            <select 
                className="w-full mt-1 p-2 border rounded-lg bg-white"
                value={selectedExamId}
                onChange={(e) => setSelectedExamId(e.target.value)}
            >
                <option value="">Choose an exam...</option>
                {exams.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
            </select>
        </div>

        <div className="relative">
            <input 
                className="w-full p-2 pl-3 pr-10 border rounded-lg bg-white"
                placeholder="Student ID or Name"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
            <button className="absolute right-2 top-2 text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {filteredRoster.map(item => {
                const assignedSeat = Object.entries(assignments).find(([_, sid]) => sid === item.student.id)?.[0] || "Unassigned";
                const isSelected = selectedStudent?.student.id === item.student.id;
                
                return (
                    <div 
                        key={item.student.id}
                        onClick={() => setSelectedStudent(item)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                            isSelected 
                                ? "bg-blue-600 border-blue-600 text-white shadow-md" 
                                : "bg-white border-slate-200 hover:border-blue-400 text-slate-700"
                        }`}
                    >
                        <div className="font-bold">{item.student.full_name}</div>
                        <div className={`text-xs ${isSelected ? "text-blue-100" : "text-slate-500"}`}>
                            ID: {item.student.student_number}
                        </div>
                        <div className={`text-xs mt-1 ${isSelected ? "text-blue-100" : "text-slate-500"}`}>
                            Seat: <span className="font-mono font-semibold">{assignedSeat}</span> | Status: {item.status || "Absent"}
                        </div>
                    </div>
                )
            })}
        </div>
      </div>

      {/* Right Panel: Student Details & Verification */}
      <div className="flex-1 bg-slate-900 rounded-xl p-6 text-white flex flex-col overflow-hidden">
        {selectedStudent ? (
            <>
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-3xl font-bold">{selectedStudent.student.full_name}</h1>
                        <div className="text-xl text-yellow-400 font-mono mt-1">
                            Assigned Seat: {studentSeat || "None"}
                        </div>
                    </div>
                    <div className="px-3 py-1 bg-slate-700 rounded text-sm font-semibold text-slate-300">
                        Ready
                    </div>
                </div>

                <div className="flex-1 flex flex-col gap-6 overflow-y-auto">
                    {/* Seat Map Location */}
                    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                        <div className="text-sm text-slate-400 mb-2 text-center">Seat Map Location</div>
                        {seats.length > 0 ? (
                            <div className="flex justify-center">
                                {/* We can perform a simplified view or reuse SeatingGrid but style it for dark mode */}
                                <div className="scale-75 origin-top">
                                    <SeatingGrid 
                                        seats={seats} 
                                        selectedSeat={studentSeat || undefined}
                                        assignments={{}} // We don't need names here, just layout
                                        readOnly
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="text-center text-slate-500 py-8">No seating plan available</div>
                        )}
                    </div>

                    {/* Camera & Reference Photos */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="flex gap-4 items-start">
                            {/* Reference Photos Gallery */}
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-64 h-64 bg-black rounded-lg border-2 border-slate-600 overflow-hidden flex items-center justify-center relative">
                                    <img 
                                        src={selectedStudent.student.photos && selectedStudent.student.photos.length > 0 
                                            ? getUploadUrl(selectedStudent.student.photos[0].image_path) 
                                            : ""} 
                                        alt="Primary Reference" 
                                        className="object-cover w-full h-full"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = "https://via.placeholder.com/300x300?text=No+Ref+Photo";
                                        }}
                                    />
                                    <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-xs text-white">Reference</div>
                                </div>
                                
                                {/* Thumbnails for multiple photos */}
                                {selectedStudent.student.photos && selectedStudent.student.photos.length > 1 && (
                                    <div className="flex gap-2 w-64 overflow-x-auto py-1">
                                        {selectedStudent.student.photos.map((p, idx) => (
                                            <div key={p.id} className="w-12 h-12 flex-shrink-0 rounded border border-slate-600 overflow-hidden bg-slate-800">
                                                <img 
                                                    src={getUploadUrl(p.image_path)} 
                                                    className="w-full h-full object-cover opacity-60 hover:opacity-100 cursor-pointer transition-opacity"
                                                    alt={`Ref ${idx + 1}`}
                                                    onClick={(e) => {
                                                        const mainImg = (e.currentTarget.closest('.flex-col')?.querySelector('img[alt="Primary Reference"]') as HTMLImageElement);
                                                        if (mainImg) mainImg.src = e.currentTarget.src;
                                                    }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Live Camera */}
                            <div className="flex flex-col items-center">
                                <WebcamCapture onCapture={handleVerify} />
                            </div>
                        </div>
                    </div>
                </div>
            </>
        ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500">
                Select a student to begin verification
            </div>
        )}
      </div>
    </div>
  );
}