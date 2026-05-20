import CaseSearch from './CaseSearch';
import { useDataState } from './DataContext';


const Audits = () => {

    const dataState = useDataState();
    
    return (
        <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 bg-[#DEE5E5]">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Page header */}
                <div className="rounded-3xl bg-white border border-[#DEE5E5] p-8 shadow-sm">
                    <h1 className="text-3xl font-bold text-[#37323E]">Audit cases</h1>
                    <p className="mt-2 text-sm text-[#6D6A75]">
                        Review investigations and generate reports.
                    </p>
                </div>

                <CaseSearch cases={dataState.cases} bikes={dataState.bikes} />
            </div>
        </div>
    );
}
export default Audits;