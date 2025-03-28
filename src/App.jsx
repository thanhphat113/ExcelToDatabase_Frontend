import { useEffect, useRef, useState } from "react";

import "./App.css";
import Select from "react-select";
import Api from "./Api";
import * as XLSX from "xlsx";
import Button from "./components/button";

function App() {
    const [databases, setDatabases] = useState([]);
    const [selectedDatabases, setSelectedDatabases] = useState();
    const [tables, setTables] = useState([]);
    const [selectedTables, setSelectedTables] = useState();
    const filesInputRef = useRef();
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedFileName, setSelectedFileName] = useState("");
    const [connection, setConnection] = useState("");

    const handleFileInputClick = (e) => {
        const file = e.target.files[0];
        const allowedMimeTypes = [
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
            "application/vnd.ms-excel", // .xls
        ];
        if (!file || !allowedMimeTypes.includes(file.type)) {
            alert("Có dữ liệu không phải file Excel hợp lệ");
            filesInputRef.current.value = "";
            setSelectedFile();
            setSelectedFileName();
            return;
        }
        setSelectedFile(file);
        setSelectedFileName(file ? file.name : "");
    };

    const handleExportExcelFileToPdf = (file) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            const binaryStr = e.target.result;
            const workbook = XLSX.read(binaryStr, { type: "buffer" });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const parsedData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

            const tableBody = parsedData.map((row) =>
                row.map((cell) => {
                    return cell?.toString() || "";
                })
            );

            const rows = tableBody.map((item) =>
                Array.from(
                    { length: item.length },
                    (_, index) => item[index] ?? ""
                )
            );

            try {
                const response = await Api.post("/api/Database", {
                    DatabaseName: selectedDatabases,
                    connectionString: connection,
                    TableName: selectedTables,
                    data: rows,
                });
                const result = response.data;
                alert(result.message);
                if (result.statusCode === 200) handleRemoveFile();
            } catch (error) {
                console.log("Lỗi", error);
            }
        };

        reader.readAsArrayBuffer(file);
    };

    const handleRemoveFile = (e) => {
        e.stopPropagation();
        setSelectedFileName("");
        setSelectedFile();
        filesInputRef.current.value = "";
    };

    useEffect(() => {
        const getTb = async () => {
            try {
                const response = await Api.get("/api/Database/tables", {
                    params: {
                        databaseName: selectedDatabases,
                        connectionString: connection,
                    },
                });
                setTables(response.data);
            } catch (error) {
                console.log("Lỗi", error);
            }
        };

        selectedDatabases ? getTb() : setTables();
    }, [selectedDatabases]);

    const handleClick = () => {
        if (filesInputRef.current) {
            filesInputRef.current.click(); // Chỉ gọi click khi có tương tác trực tiếp
        }
    };

    const handleConnection = async (connectionString) => {
        console.log(connectionString);
        if (!connectionString) {
            alert("Vui lòng điền chuỗi kết nối của bạn");
            return;
        }
        try {
            const response = await Api.get("/api/Database/list", {
                params: { connectionString: connectionString },
            });
            const result = response.data;
            if (result.statusCode === 200) setDatabases(result.result);
            else alert(result.message);
        } catch (error) {
            console.log("Lỗi", error);
        }
    };

    return (
        <>
            <div className=" w-full h-screen flex flex-col justify-center items-center">
                <div className="w-1/2 h-1/2">
                    <div className="mb-3 flex gap-5">
                        <label>Chuỗi kết nối: </label>
                        <input
                            className="border bg-white ps-4 flex-1"
                            value={connection}
                            onChange={(e) => setConnection(e.target.value)}
                            placeholder="Chuỗi kết nối..."
                        ></input>
                        <div className="h-[3rem] w-[10rem]">
                            <Button
                                action={() => handleConnection(connection)}
                                label="Xác nhận"
                            />
                        </div>
                    </div>
                    <div className="flex justify-between">
                        <div className="w-1/2 h-[3rem] flex gap-5 justify-between items-center">
                            <span>Database: </span>
                            <Select
                                options={
                                    databases
                                        ? databases.map((item) => ({
                                              value: item.name,
                                              label: item.name,
                                          }))
                                        : []
                                }
                                className=" w-100"
                                placeholder="Chọn database..."
                                onChange={(selectedOptions) =>
                                    setSelectedDatabases(selectedOptions.value)
                                }
                            />
                        </div>
                        <div className="w-1/3 h-[3rem] flex gap-5 justify-between items-center">
                            <span>Tables: </span>
                            <Select
                                options={
                                    tables
                                        ? tables.map((item) => ({
                                              value: item.name,
                                              label: item.name,
                                          }))
                                        : []
                                }
                                className="mw-[5rem]"
                                placeholder="Chọn table..."
                                onChange={(selectedOptions) =>
                                    setSelectedTables(selectedOptions.value)
                                }
                            />
                        </div>
                        {selectedFile && (
                            <div className=" w-1/4 h-[3rem] flex gap-5 justify-between items-center">
                                <Button
                                    label="Xác nhận"
                                    action={() =>
                                        handleExportExcelFileToPdf(selectedFile)
                                    }
                                />
                            </div>
                        )}
                    </div>

                    <div
                        className=" h-full mt-5 shadow-[0_0_10px_rgba(0,0,0,0.3)] cursor-pointer group p-5 rounded-2xl"
                        onClick={() => handleClick()}
                    >
                        <input
                            hidden
                            ref={filesInputRef}
                            type="file"
                            onChange={(e) => handleFileInputClick(e)}
                        ></input>
                        <div className="w-full flex relative flex-col items-center justify-center h-full border border-dashed  rounded-2xl">
                            {selectedFile && (
                                <div onClick={(e) => handleRemoveFile(e)}>
                                    <i className="fas fa-times hover:text-red-600 top-5 text-3xl absolute right-5"></i>
                                </div>
                            )}
                            <div className="">
                                <i className="fas fa-cloud-upload-alt text-5xl group-hover:text-6xl transition-all ease-in-out duration-[0.3s]"></i>
                            </div>
                            <span>Thả tệp tài liệu vào đây</span>
                            {selectedFileName && (
                                <span className="mt-2 text-gray-700">
                                    {selectedFileName}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default App;
