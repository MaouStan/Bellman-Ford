// เมื่อเอกสาร HTML ถูกโหลดเสร็จแล้ว จะเริ่มทำงานในฟังก์ชันนี้
document.addEventListener('DOMContentLoaded', () => {
    // ดึง element canvas ที่มี id เป็น 'graphCanvas'
    const canvas = document.getElementById('graphCanvas');
    // สร้าง context สำหรับการวาด 2D บน canvas
    const ctx = canvas.getContext('2d');
    // ดึง element select ที่มี id เป็น 'source'
    const sourceSelect = document.getElementById('source');
    // ดึงปุ่มที่มี id เป็น 'run'
    const runButton = document.getElementById('run');
    // ดึงปุ่มที่มี id เป็น 'addEdge'
    const addEdgeButton = document.getElementById('addEdge');

    // สร้างแผนที่ (Map) สำหรับเก็บข้อมูลกราฟ
    let graph = new Map();
    // สร้างแผนที่ (Map) สำหรับเก็บตำแหน่งของโหนด
    let positions = new Map();
    // ตัวแปรสำหรับนับจำนวนโหนด
    let nodeCount = 0;

    // ดึง input ที่มี id เป็น 'nodeName'
    const nodeNameInput = document.getElementById('nodeName');
    // ดึงปุ่มที่มี id เป็น 'addCustomNode'
    const addCustomNodeButton = document.getElementById('addCustomNode');

    // ดึง element select ที่มี id เป็น 'deleteNode'
    const deleteNodeSelect = document.getElementById('deleteNode');
    // ดึงปุ่มที่มี id เป็น 'deleteNodeButton'
    const deleteNodeButton = document.getElementById('deleteNodeButton');

    // ตัวแปรสำหรับตรวจสอบว่ากำลังลากโหนดอยู่หรือไม่
    let isDragging = false;
    // ตัวแปรสำหรับเก็บโหนดที่กำลังถูกลาก
    let draggedNode = null;
    // ตัวแปรสำหรับเก็บระยะห่างระหว่างตำแหน่งเมาส์กับโหนด
    let offsetX, offsetY;

    // เพิ่ม event listener สำหรับการกดเมาส์ลงบน canvas
    canvas.addEventListener('mousedown', handleMouseDown);
    // เพิ่ม event listener สำหรับการเคลื่อนที่ของเมาส์บน canvas
    canvas.addEventListener('mousemove', handleMouseMove);
    // เพิ่ม event listener สำหรับการปล่อยเมาส์บน canvas
    canvas.addEventListener('mouseup', handleMouseUp);
    // เพิ่ม event listener สำหรับการออกจาก canvas ของเมาส์
    canvas.addEventListener('mouseleave', handleMouseUp);
    sourceSelect.addEventListener('change', () => {
        drawGraph();
        // เมื่อมีการเปลี่ยนแปลงใน select ของ source จะเรียกฟังก์ชัน drawGraph
    });

    // ตัวแปรสำหรับเก็บโหนดที่ถูกเลือก
    let selectedNode = null;

    // ฟังก์ชันสำหรับจัดการเมื่อคลิกปุ่มเพิ่มขอบ
    function handleAddEdgeClick() {
        // เพิ่ม event listener สำหรับการคลิกบน canvas เพื่อเลือโหนด
        canvas.addEventListener('click', selectNodeForEdge);
        // แสดงข้อความแจ้งเตือนให้ผู้ใช้คลิกเลือกโหนดต้นทางและปลายทาง
        alert('Click on the source node, then the destination node.');
    }

    // ฟังก์ชันสำหรับเลือกโหนดเพื่อเพิ่มขอบ
    function selectNodeForEdge(e) {
        // หาตำแหน่งของเมาส์บน canvas
        const mousePos = getMousePos(canvas, e);
        // วนลูปผ่านตำแหน่งของโหนดทั้งหมด
        for (let [node, [x, y]] of positions.entries()) {
            // ตรวจสอบว่าเมาส์อยู่ภายในโหนดหรือไม่
            if (isInsideNode(mousePos, x, y)) {
                // ถ้ายังไม่มีโหนดที่ถูกเลือก
                if (!selectedNode) {
                    // กำหนดโหนดที่ถูกเลือกเป็นโหนดปัจจุบัน
                    selectedNode = node;
                    // แสดงข้อความแจ้งเตือนให้ผู้ใช้คลิกเลือกโหนดปลายทาง
                    alert(`Selected source node: ${node}. Now click on the destination node.`);
                } else {
                    // กำหนดโหนดปลายทางเป็นโหนดปัจจุบัน
                    const destinationNode = node;
                    // ถ้าโหนดต้นทางและปลายทางไม่ใช่โหนดเดียวกัน
                    if (selectedNode !== destinationNode) {
                        // ขอให้ผู้ใช้ป้อนน้ำหนักของขอบ
                        const weight = prompt(`Enter weight for edge from ${selectedNode} to ${destinationNode}:`);
                        // ถ้าน้ำหนักที่ป้อนไม่เป็น null และเป็นตัวเลข
                        if (weight !== null && !isNaN(weight)) {
                            // เพิ่มขอบใหม่ในกราฟ
                            graph.get(selectedNode).edges.push({ v: destinationNode, weight: parseInt(weight, 10) });
                            // วาดกราฟใหม่
                            drawGraph();
                        } else {
                            // แสดงข้อความแจ้งเตือนว่าน้ำหนักไม่ถูกต้อง
                            alert('Invalid weight. Please try again.');
                        }
                    } else {
                        // แสดงข้อความแจ้งเตือนว่าโหนดต้นทางและปลายทางต้องไม่ใช่โหนดเดียวกัน
                        alert('Source and destination nodes cannot be the same. Please try again.');
                    }
                    // รีเซ็ตโหนดที่ถูกเลือก
                    selectedNode = null;
                    // ลบ event listener สำหรับการคลิกบน canvas
                    canvas.removeEventListener('click', selectNodeForEdge);
                }
                break;
            }
        }
    }

    // เพิ่ม event listener สำหรับการคลิกปุ่มเพิ่มขอบ
    addEdgeButton.addEventListener('click', handleAddEdgeClick);

    // ฟังก์ชันสำหรับจัดการเมื่อกดเมาส์ลงบน canvas
    function handleMouseDown(e) {
        // หาตำแหน่งของเมาส์บน canvas
        const mousePos = getMousePos(canvas, e);
        // วนลูปผ่านตำแหน่งของโหนดทั้งหมด
        for (let [node, [x, y]] of positions.entries()) {
            // ตรวจสอบว่าเมาส์อยู่ภายในโหนดหรือไม่
            if (isInsideNode(mousePos, x, y)) {
                // กำหนดสถานะการลากเป็น true
                isDragging = true;
                // กำหนดโหนดที่ถูกลากเป็นโหนดปัจจุบัน
                draggedNode = node;
                // คำนวณระยะห่างระหว่างตำแหน่งเมาส์กับโหนดในแนวนอน
                offsetX = x - mousePos.x;
                // คำนวณระยะห่างระหว่างตำแหน่งเมาส์กับโหนดในแนวตั้ง
                offsetY = y - mousePos.y;
                break;
            }
        }
    }

    // ฟังก์ชันสำหรับจัดการเมื่อเคลื่อนที่เมาส์บน canvas
    function handleMouseMove(e) {
        // ถ้ากำลังลากโหนดอยู่
        if (isDragging && draggedNode) {
            // หาตำแหน่งของเมาส์บน canvas
            const mousePos = getMousePos(canvas, e);
            positions.set(draggedNode, [
                mousePos.x + offsetX,
                mousePos.y + offsetY
                // อัปเดตตำแหน่งของโหนดที่ถูกลาก
            ]);
            // วาดกราฟใหม่
            drawGraph();
        }
    }

    // ฟังก์ชันสำหรับจัดการเมื่อปล่อยเมาส์บน canvas
    function handleMouseUp(e) {
        // ถ้ากำลังลากโหนดอยู่
        if (isDragging) {
            // กำหนดสถานะการลากเป็น false
            isDragging = false;
            // รีเซ็ตโหนดที่ถูกลาก
            draggedNode = null;
        }
    }

    // ฟังก์ชันสำหรับหาตำแหน่งของเมาส์บน canvas
    function getMousePos(canvas, evt) {
        // หาขอบเขตของ canvas
        const rect = canvas.getBoundingClientRect();
        return {
            // คำนวณตำแหน่ง x ของเมาส์บน canvas
            x: evt.clientX - rect.left,
            // คำนวณตำแหน่ง y ของเมาส์บน canvas
            y: evt.clientY - rect.top
        };
    }

    // ฟังก์ชันสำหรับตรวจสอบว่าเมาส์อยู่ภายในโหนดหรือไม่
    function isInsideNode(pos, x, y) {
        // คำนวณระยะห่างในแนวนอนระหว่างเมาส์กับโหนด
        const dx = pos.x - x;
        // คำนวณระยะห่างในแนวตั้งระหว่างเมาส์กับโหนด
        const dy = pos.y - y;
        // ตรวจสอบว่าระยะห่างระหว่างเมาส์กับโหนดน้อยกว่า 20 หรือไม่
        return Math.sqrt(dx * dx + dy * dy) < 20;
    }

    // ฟังก์ชันสำหรับวาดลูกศร
    function drawArrow(fromx, fromy, tox, toy, color = 'black', lineWidth = 1) {
        // กำหนดความยาวของหัวลูกศร
        const headLength = 10;
        // คำนวณระยะห่างในแนวนอนระหว่างจุดเริ่มต้นและจุดสิ้นสุด
        const dx = tox - fromx;
        // คำนวณระยะห่างในแนวตั้งระหว่างจุดเริ่มต้นและจุดสิ้นสุด
        const dy = toy - fromy;
        // คำนวณมุมของลูกศร
        const angle = Math.atan2(dy, dx);

        // เริ่มต้นเส้นทางใหม่
        ctx.beginPath();
        // ย้ายไปยังจุดเริ่มต้นของลูกศร
        ctx.moveTo(fromx, fromy);
        // วาดเส้นไปยังจุดสิ้นสุดของลูกศร
        ctx.lineTo(tox, toy);
        // กำหนดสีของเส้น
        ctx.strokeStyle = color;
        // กำหนดความหนาของเส้น
        ctx.lineWidth = lineWidth;
        // วาดเส้น
        ctx.stroke();

        // เริ่มต้นเส้นทางใหม่สำหรับหัวลูกศร
        ctx.beginPath();
        // ย้ายไปยังจุดสิ้นสุดของลูกศร
        ctx.moveTo(tox, toy);
        ctx.lineTo(
            tox - headLength * Math.cos(angle - Math.PI / 6),
            toy - headLength * Math.sin(angle - Math.PI / 6)
            // วาดเส้นไปยังจุดแรกของหัวลูกศร
        );
        ctx.lineTo(
            tox - headLength * Math.cos(angle + Math.PI / 6),
            toy - headLength * Math.sin(angle + Math.PI / 6)
            // วาดเส้นไปยังจุดที่สองของหัวลูกศร
        );
        // วาดเส้นกลับไปยังจุดสิ้นสุดของลูกศร
        ctx.lineTo(tox, toy);
        // กำหนดสีของหัวลูกศร
        ctx.fillStyle = color;
        // เติมสีให้กับหัวลูกศร
        ctx.fill();
    }

    // ฟังก์ชันสำหรับวาดกราฟ
    function drawGraph(highlightPath = []) {
        // ล้าง canvas ทั้งหมด
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // วนลูปผ่านโหนดทั้งหมดในกราฟ
        graph.forEach(({ edges }, u) => {
            // กำหนดระยะห่างของขอบ
            var offset_distance = 10;
            // วนลูปผ่านขอบทั้งหมดของโหนด
            edges.forEach(({ v, weight }) => {
                // ดึงตำแหน่งของโหนดต้นทาง
                var [x1, y1] = positions.get(u);
                // ดึงตำแหน่งของโหนดปลายทาง
                var [x2, y2] = positions.get(v);

                // สร้างคีย์สำหรับขอบ
                const edgeKey = `${u}-${v}`;
                // ตรวจสอบว่าขอบนี้อยู่ในเส้นทางที่ต้องการเน้นหรือไม่
                const isHighlighted = highlightPath.includes(edgeKey);
                // กำหนดสีของขอบ
                const color = isHighlighted ? 'red' : 'black';
                // กำหนดความหนาของขอบ
                const lineWidth = isHighlighted ? 3 : 1;

                // คำนวณระยะห่างในแนวนอนระหว่างโหนดต้นทางและปลายทาง
                var dx = x2 - x1;
                // คำนวณระยะห่างในแนวตั้งระหว่างโหนดต้นทางและปลายทาง
                var dy = y2 - y1;
                // คำนวณความยาวของขอบ
                var length = (dx ** 2 + dy ** 2) ** 0.5;

                // กำหนดความยาวของลูกศร
                var arrow_length = 20;
                // ปรับตำแหน่ง x ของโหนดปลายทาง
                x2 = x2 - (dx / length) * arrow_length;
                // ปรับตำแหน่ง y ของโหนดปลายทาง
                y2 = y2 - (dy / length) * arrow_length;

                // คำนวณการเลื่อนในแนวนอน
                var offset_x = -dy / length * offset_distance;
                // คำนวณการเลื่อนในแนวตั้ง
                var offset_y = dx / length * offset_distance;

                // ถ้ามีขอบย้อนกลับจากโหนดปลายทางไปยังโหนดต้นทาง
                if (graph.get(v).edges.some(edge => edge.v === u)) {
                    // ปรับตำแหน่ง x ของโหนดต้นทาง
                    x1 += offset_x;
                    // ปรับตำแหน่ง y ของโหนดต้นทาง
                    y1 += offset_y;
                    // ปรับตำแหน่ง x ของโหนดปลายทาง
                    x2 += offset_x;
                    // ปรับตำแหน่ง y ของโหนดปลายทาง
                    y2 += offset_y;
                } else {
                    // ปรับตำแหน่ง x ของโหนดต้นทาง
                    x1 -= offset_x;
                    // ปรับตำแหน่ง y ของโหนดต้นทาง
                    y1 -= offset_y;
                    // ปรับตำแหน่ง x ของโหนดปลายทาง
                    x2 -= offset_x;
                    // ปรับตำแหน่ง y ของโหนดปลายทาง
                    y2 -= offset_y;
                }

                // วาดลูกศรระหว่างโหนดต้นทางและปลายทาง
                drawArrow(x1, y1, x2, y2, color, lineWidth);

                // กำหนดสีของข้อความ
                ctx.fillStyle = 'black';
                // กำหนดฟอนต์ของข้อความ
                ctx.font = '14px Arial';
                // กำหนดการจัดตำแหน่งของข้อความ
                ctx.textAlign = 'center';
                // กำหนดการจัดแนวของข้อความ
                ctx.textBaseline = 'middle';

                // กำหนดการเลื่อนในแนวนอน
                offset_x = 10;
                // กำหนดการเลื่อนในแนวตั้ง
                offset_y = 10;
                // วาดน้ำหนักของขอบ
                ctx.fillText(weight, (x1 + x2) / 2, (y1 + y2) / 2 + offset_y);
            });
        });

        // ดึงค่าโหนดต้นทางจาก select
        const source = sourceSelect.value;

        // วนลูปผ่านตำแหน่งของโหนดทั้งหมด
        positions.forEach(([x, y], node) => {
            // เริ่มต้นเส้นทางใหม่
            ctx.beginPath();
            // วาดวงกลมสำหรับโหนด
            ctx.arc(x, y, 20, 0, 2 * Math.PI);

            // ถ้าโหนดเป็นโหนดต้นทาง
            if (node === source) {
                // กำหนดสีของโหนดเป็นสีเขียว
                ctx.fillStyle = 'green';
            } else {
                // กำหนดสีของโหนดเป็นสีฟ้าอ่อน
                ctx.fillStyle = 'lightblue';
            }
            // เติมสีให้กับโหนด
            ctx.fill();
            // วาดเส้นรอบโหนด
            ctx.stroke();
            // กำหนดสีของข้อความ
            ctx.fillStyle = 'black';
            // กำหนดฟอนต์ของข้อความ
            ctx.font = '14px Arial';
            // กำหนดการจัดตำแหน่งของข้อความ
            ctx.textAlign = 'center';
            // กำหนดการจัดแนวของข้อความ
            ctx.textBaseline = 'middle';
            // วาดชื่อของโหนด
            ctx.fillText(node, x, y);
        });
    }

    // ฟังก์ชันสำหรับรันอัลกอริทึม Bellman-Ford
    function runBellmanFord() {
        // ดึงค่าโหนดต้นทางจาก select
        const source = sourceSelect.value;
        // สร้างแผนที่สำหรับเก็บระยะทาง
        const distances = new Map();
        // สร้างแผนที่สำหรับเก็บโหนดก่อนหน้า
        const predecessors = new Map();
        // วนลูปผ่านโหนดทั้งหมดในกราฟ
        graph.forEach((nodeData, node) => {
            // กำหนดระยะทางเริ่มต้นเป็น Infinity
            distances.set(node, Infinity);
        });
        // กำหนดระยะทางของโหนดต้นทางเป็น 0
        distances.set(source, 0);

        // วนลูป n-1 ครั้ง (n คือจำนวนโหนด)
        for (let i = 0; i < graph.size - 1; i++) {
            // วนลูปผ่านโหนดทั้งหมดในกราฟ
            graph.forEach((nodeData, u) => {
                // วนลูปผ่านขอบทั้งหมดของโหนด
                nodeData.edges.forEach(({ v, weight }) => {
                    // ถ้าระยะทางใหม่สั้นกว่าระยะทางเดิม
                    if (distances.get(u) + weight < distances.get(v)) {
                        // อัปเดตระยะทางใหม่
                        distances.set(v, distances.get(u) + weight);
                        // อัปเดตโหนดก่อนหน้า
                        predecessors.set(v, u);
                    }
                });
            });
        }

        // แสดงระยะทางทั้งหมดใน console
        console.log(distances);

        // ตัวแปรสำหรับตรวจสอบว่ามีวงจรน้ำหนักลบหรือไม่
        let hasNegativeCycle = false;
        // วนลูปผ่านโหนดทั้งหมดในกราฟ
        graph.forEach((nodeData, u) => {
            // วนลูปผ่านขอบทั้งหมดของโหนด
            nodeData.edges.forEach(({ v, weight }) => {
                // ถ้าระยะทางใหม่สั้นกว่าระยะทางเดิม
                if (distances.get(u) + weight < distances.get(v)) {
                    // แสดงข้อความใน console ว่าพบวงจรน้ำหนักลบ
                    console.log("Negative Cycle Detected between", u, v);
                    // กำหนดสถานะว่าพบวงจรน้ำหนักลบ
                    hasNegativeCycle = true;
                }
            });
        });

        // ถ้าพบวงจรน้ำหนักลบ
        if (hasNegativeCycle) {
            // แสดงข้อความแจ้งเตือนว่ากราฟมีวงจรน้ำหนักลบ
            alert("Graph contains a negative-weight cycle");
            // ออกจากฟังก์ชัน
            return;
        }

        // สร้างอาเรย์สำหรับเก็บผลลัพธ์
        const results = [];
        // วนลูปผ่านโหนดทั้งหมดในกราฟ
        graph.forEach((_, node) => {
            // ดึงระยะทางของโหนด
            const distance = distances.get(node);
            // สร้างเส้นทางจากโหนดต้นทางไปยังโหนดปัจจุบัน
            const path = reconstructPath(predecessors, source, node);
            // เพิ่มผลลัพธ์ในอาเรย์
            results.push({ name: node, distance: distance, path: path });
        });

        // แสดงผลลัพธ์ในตาราง
        displayResultsTable(results);
        // วาดกราฟพร้อมเน้นเส้นทาง
        drawGraph(predecessorsToHighlight(predecessors));
    }

    // ฟังก์ชันสำหรับเพิ่มโหนดใหม่
    function addCustomNode() {
        // ดึงชื่อโหนดจาก input และตัดช่องว่าง
        const name = nodeNameInput.value.trim();

        // ถ้าชื่อโหนดว่าง
        if (!name) {
            // แสดงข้อความแจ้งเตือนว่าชื่อโหนดต้องไม่ว่าง
            alert('Node name cannot be empty.');
            // ออกจากฟังก์ชัน
            return;
        }

        // ถ้ามีโหนดที่มีชื่อนี้อยู่แล้ว
        if (graph.has(name)) {
            // แสดงข้อความแจ้งเตือนว่าโหนดที่มีชื่อนี้มีอยู่แล้ว
            alert('Node with this name already exists.');
            // ออกจากฟังก์ชัน
            return;
        }

        // เพิ่มโหนดใหม่ในกราฟ
        graph.set(name, { edges: [] });

        // ดึงจำนวนโหนดทั้งหมด
        const totalNodes = graph.size;
        // คำนวณมุมสำหรับวางโหนดใหม่
        const angle = (2 * Math.PI / totalNodes) * (totalNodes - 1);
        // คำนวณรัศมีสำหรับวางโหนดใหม่
        const radius = Math.min(canvas.width, canvas.height) / 3;
        // คำนวณตำแหน่ง x ของจุดศูนย์กลาง
        const centerX = canvas.width / 2;
        // คำนวณตำแหน่ง y ของจุดศูนย์กลาง
        const centerY = canvas.height / 2;
        // คำนวณตำแหน่ง x ของโหนดใหม่
        const x = centerX + radius * Math.cos(angle);
        // คำนวณตำแหน่ง y ของโหนดใหม่
        const y = centerY + radius * Math.sin(angle);

        // เพิ่มตำแหน่งของโหนดใหม่ในแผนที่
        positions.set(name, [x, y]);

        // สร้าง element option ใหม่
        const option = document.createElement('option');
        // กำหนดค่า value ของ option
        option.value = name;
        // กำหนดข้อความของ option
        option.text = name;
        // เพิ่ม option ใน select ของ source
        sourceSelect.add(option);
        // เพิ่ม option ใน select ของ deleteNode
        deleteNodeSelect.add(option.cloneNode(true));

        // วาดกราฟใหม่
        drawGraph();
        // รีเซ็ตค่าใน input ของ nodeName
        nodeNameInput.value = '';
    }

    // ฟังก์ชันสำหรับลบโหนดที่เลือก
    function deleteSelectedNode() {
        // ดึงค่าโหนดที่เลือกจาก select
        const node = deleteNodeSelect.value;
        // ถ้าไม่มีโหนดที่ถูกเลือก
        if (!node) {
            // แสดงข้อความแจ้งเตือนว่าไม่มีโหนดที่ถูกเลือก
            alert('No node selected.');
            // ออกจากฟังก์ชัน
            return;
        }

        // ลบโหนดจากกราฟ
        graph.delete(node);
        // ลบตำแหน่งของโหนดจากแผนที่
        positions.delete(node);

        // วนลูปผ่านโหนดทั้งหมดในกราฟ
        graph.forEach((nodeData, u) => {
            // ลบขอบที่มีโหนดปลายทางเป็นโหนดที่ถูกลบ
            nodeData.edges = nodeData.edges.filter(edge => edge.v !== node);
        });

        // วนลูปผ่าน option ทั้งหมดใน select ของ source
        for (let i = 0; i < sourceSelect.options.length; i++) {
            // ถ้า option มีค่า value เท่ากับโหนดที่ถูกลบ
            if (sourceSelect.options[i].value === node) {
                // ลบ option ออกจาก select
                sourceSelect.remove(i);
                break;
            }
        }

        // วนลูปผ่าน option ทั้งหมดใน select ของ deleteNode
        for (let i = 0; i < deleteNodeSelect.options.length; i++) {
            // ถ้า option มีค่า value เท่ากับโหนดที่ถูกลบ
            if (deleteNodeSelect.options[i].value === node) {
                // ลบ option ออกจาก select
                deleteNodeSelect.remove(i);
                break;
            }
        }

        // วาดกราฟใหม่
        drawGraph();
    }

    // เพิ่ม event listener สำหรับการคลิกปุ่มเพิ่มโหนดใหม่
    addCustomNodeButton.addEventListener('click', addCustomNode);
    // เพิ่ม event listener สำหรับการคลิกปุ่มลบโหนดที่เลือก
    deleteNodeButton.addEventListener('click', deleteSelectedNode);

    // เพิ่ม event listener สำหรับการคลิกปุ่มเพิ่มขอบ
    addEdgeButton.addEventListener('click', addEdge);
    // เพิ่ม event listener สำหรับการคลิกปุ่มรันอัลกอริทึม Bellman-Ford
    runButton.addEventListener('click', runBellmanFord);

    // ฟังก์ชันสำหรับสร้างเส้นทางจากโหนดต้นทางไปยังโหนดที่กำหนด
    function reconstructPath(predecessors, source, node) {
        // ถ้าโหนดเป็นโหนดต้นทาง
        if (node === source) {
            // คืนค่าโหนดต้นทาง
            return source;
        }
        // ถ้าไม่มีโหนดก่อนหน้าสำหรับโหนดที่กำหนด
        if (!predecessors.has(node)) {
            // คืนค่า "No path"
            return "No path";
        }
        // สร้างอาเรย์สำหรับเก็บเส้นทาง
        const path = [];
        // กำหนดโหนดปัจจุบันเป็นโหนดที่กำหนด
        let current = node;
        // วนลูปจนกว่าโหนดปัจจุบันจะเป็นโหนดต้นทาง
        while (current !== source) {
            // เพิ่มโหนดปัจจุบันในเส้นทาง
            path.unshift(current);
            // อัปเดตโหนดปัจจุบันเป็นโหนดก่อนหน้า
            current = predecessors.get(current);
            // ถ้าโหนดปัจจุบันเป็น undefined
            if (current === undefined) {
                // คืนค่า "No path"
                return "No path";
            }
        }
        // เพิ่มโหนดต้นทางในเส้นทาง
        path.unshift(source);
        // คืนค่าเส้นทางที่เชื่อมต่อกันด้วย " -> "
        return path.join(" -> ");
    }

    // ฟังก์ชันสำหรับรับแสดงผลลัพธ์ในตาราง
    function displayResultsTable(results) {
        // ดึง element tbody ของตารางผลลัพธ์
        const tableBody = document.querySelector('#resultsTable tbody');
        // แสดงตารางผลลัพธ์
        document.getElementById('resultsTable').style.visibility = 'visible';
        // ล้างเนื้อหาของ tbody
        tableBody.innerHTML = '';

        // วนลูปผ่านผลลัพธ์ทั้งหมด
        results.forEach(result => {
            // สร้าง element tr ใหม่
            const row = document.createElement('tr');

            // สร้าง element td สำหรับชื่อโหนด
            const nameCell = document.createElement('td');
            // กำหนดข้อความของเซลล์เป็นชื่อโหนด
            nameCell.textContent = result.name;
            // เพิ่มเซลล์ในแถว
            row.appendChild(nameCell);

            // สร้าง element td สำหรับระยะทาง
            const distanceCell = document.createElement('td');
            // กำหนดข้อความของเซลล์เป็นระยะทาง
            distanceCell.textContent = result.distance;
            // เพิ่มเซลล์ในแถว
            row.appendChild(distanceCell);

            // สร้าง element td สำหรับเส้นทาง
            const pathCell = document.createElement('td');
            // กำหนดข้อความของเซลล์เป็นเส้นทาง
            pathCell.textContent = result.path;
            // เพิ่มเซลล์ในแถว
            row.appendChild(pathCell);

            // เพิ่มแถวใน tbody
            tableBody.appendChild(row);
        });
    }

    // ฟังก์ชันสำหรับสร้างเส้นทางที่ต้องการเน้น
    function predecessorsToHighlight(predecessors) {
        // สร้างอาเรย์สำหรับเก็บเส้นทางที่ต้องการเน้น
        const highlightPath = [];
        // วนลูปผ่านโหนดก่อนหน้าทั้งหมด
        predecessors.forEach((u, v) => {
            // เพิ่มเส้นทางในอาเรย์
            highlightPath.push(`${u}-${v}`);
        });
        // คืนค่าเส้นทางที่ต้องการเน้น
        return highlightPath;
    }

    // ดึงปุ่มที่มี id เป็น 'importMatrix'
    const importMatrixButton = document.getElementById('importMatrix');
    // ดึงปุ่มที่มี id เป็น 'importList'
    const importListButton = document.getElementById('importList');

    importMatrixButton.addEventListener('click', () => {
        // แสดง modal สำหรับการนำเข้าข้อมูลแบบเมทริกซ์
        $('#matrixModal').modal('show');
    });

    importListButton.addEventListener('click', () => {
        // แสดง modal สำหรับการนำเข้าข้อมูลแบบรายการ
        $('#listModal').modal('show');
    });

    document.getElementById('submitMatrix').addEventListener('click', () => {
        // ดึงค่าจาก input ของเมทริกซ์
        const matrixInput = document.getElementById('matrixInput').value;
        // เรียกฟังก์ชันนำเข้าข้อมูลจากเมทริกซ์
        importFromMatrix(matrixInput);
        // ซ่อน modal ของเมทริกซ์
        $('#matrixModal').modal('hide');
    });

    document.getElementById('submitList').addEventListener('click', () => {
        // ดึงค่าจาก input ของรายการ
        const listInput = document.getElementById('listInput').value;
        // เรียกฟังก์ชันนำเข้าข้อมูลจากรายการ
        importFromList(listInput);
        // ซ่อน modal ของรายการ
        $('#listModal').modal('hide');
    });

    // ฟังก์ชันสำหรับนำเข้าข้อมูลจากเมทริกซ์
    function importFromMatrix(matrixInput) {
        try {
            // แปลงข้อมูลเมทริกซ์จาก JSON
            const matrix = JSON.parse(matrixInput.replace(/(\d+),/g, '$1,').replace(/(\d+)\}/g, '$1}'));
            // สร้างชื่อโหนดจากจำนวนโหนดในเมทริกซ์
            const nodeNames = generateNodeNames(matrix.length);

            // ล้างกราฟ
            graph.clear();
            // ล้างตำแหน่งของโหนด
            positions.clear();
            // วนลูปผ่านชื่อโหนดทั้งหมด
            nodeNames.forEach((name, index) => {
                // เพิ่มโหนดใหม่ในกราฟ
                graph.set(name, { edges: [] });
                // วนลูปผ่านเมทริกซ์
                for (let j = 0; j < matrix[index].length; j++) {
                    // ถ้ามีน้ำหนักที่ไม่เป็น 0
                    if (matrix[index][j] !== 0) {
                        // เพิ่มขอบใหม่ในกราฟ
                        graph.get(name).edges.push({ v: nodeNames[j], weight: matrix[index][j] });
                    }
                }
            });

            // อัปเดตตำแหน่งของโหนดและ select
            updateNodePositionsAndSelects(nodeNames);
            // วาดกราฟใหม่
            drawGraph();
        } catch (error) {
            // แสดงข้อความแจ้งเตือนว่าเมทริกซ์ไม่ถูกต้อง
            alert('Invalid matrix format.');
        }
    }

    // ฟังก์ชันสำหรับนำเข้าข้อมูลจากรายการ
    function importFromList(listInput) {
        try {
            // Split the input by lines and then by edges
            const lines = listInput.split('\n');
            graph.clear();
            positions.clear();

            lines.forEach(line => {
                const edges = line.split('-->');
                const start = edges[0].trim().split(':')[0].trim();
                for (let i = 1; i < edges.length; i++) {
                    const [end, weight] = edges[i].split(',').map(part => part.trim());
                    if (!graph.has(start)) graph.set(start, { edges: [] });
                    if (!graph.has(end)) graph.set(end, { edges: [] });
                    graph.get(start).edges.push({ v: end, weight: parseInt(weight, 10) });
                }
            });

            const nodeNames = Array.from(graph.keys());
            updateNodePositionsAndSelects(nodeNames);
            drawGraph();
        } catch (error) {
            alert('Invalid list format.');
        }
    }

    // ฟังก์ชันสำหรับสร้างชื่อโหนด
    function generateNodeNames(count) {
        // สร้างอาเรย์สำหรับเก็บชื่อโหนด
        const names = [];
        // วนลูปตามจำนวนโหนด
        for (let i = 0; i < count; i++) {
            // สร้างตัวแปรสำหรับเก็บชื่อโหนด
            let name = '';
            // กำหนดค่า n เป็น i
            let n = i;
            // วนลูปจนกว่า n จะน้อยกว่า 0
            while (n >= 0) {
                // สร้างชื่อโหนดจากตัวอักษร
                name = String.fromCharCode((n % 26) + 65) + name;
                // อัปเดตค่า n
                n = Math.floor(n / 26) - 1;
            }
            // เพิ่มชื่อโหนดในอาเรย์
            names.push(name);
        }
        // คืนค่าชื่อโหนด
        return names;
    }

    // ฟังก์ชันสำหรับอัปเดตตำแหน่งของโหนดและ select
    function updateNodePositionsAndSelects(nodeNames) {
        // ดึงจำนวนโหนดทั้งหมด
        const totalNodes = nodeNames.length;
        // คำนวณรัศมีสำหรับวางโหนด
        const radius = Math.min(canvas.width, canvas.height) / 3;
        // คำนวณตำแหน่ง x ของจุดศูนย์กลาง
        const centerX = canvas.width / 2;
        // คำนวณตำแหน่ง y ของจุดศูนย์กลาง
        const centerY = canvas.height / 2;

        // วนลูปผ่านชื่อโหนดทั้งหมด
        nodeNames.forEach((name, index) => {
            // คำนวณมุมสำหรับวางโหนด
            const angle = (2 * Math.PI / totalNodes) * index;
            // คำนวณตำแหน่ง x ของโหนด
            const x = centerX + radius * Math.cos(angle);
            // คำนวณตำแหน่ง y ของโหนด
            const y = centerY + radius * Math.sin(angle);
            // เพิ่มตำแหน่งของโหนดในแผนที่
            positions.set(name, [x, y]);

            // สร้าง element option ใหม่
            const option = document.createElement('option');
            // กำหนดค่า value ของ option
            option.value = name;
            // กำหนดข้อความของ option
            option.text = name;
            // เพิ่ม option ใน select ของ source
            sourceSelect.add(option);
            // เพิ่ม option ใน select ของ deleteNode
            deleteNodeSelect.add(option.cloneNode(true));
        });
    }
});
