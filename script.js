const canvas = document.getElementById('graphCanvas'); // ดึง element canvas จาก HTML
const ctx = canvas.getContext('2d'); // สร้าง context สำหรับการวาดบน canvas
const sourceSelect = document.getElementById('source'); // ดึง element select สำหรับเลือก source node
const runButton = document.getElementById('run'); // ดึงปุ่ม run
const addEdgeButton = document.getElementById('addEdge'); // ดึงปุ่ม add edge

let graph = new Map(); // สร้างแผนที่สำหรับเก็บข้อมูลกราฟ
let positions = new Map(); // สร้างแผนที่สำหรับเก็บตำแหน่งของ node
let nodeCount = 0; // ตัวนับจำนวน node

// New Elements for Custom Node Addition
const nodeNameInput = document.getElementById('nodeName'); // ดึง input สำหรับใส่ชื่อ node
const addCustomNodeButton = document.getElementById('addCustomNode'); // ดึงปุ่มสำหรับเพิ่ม custom node

// Elements for Node Deletion
const deleteNodeSelect = document.getElementById('deleteNode'); // ดึง select สำหรับเลือก node ที่จะลบ
const deleteNodeButton = document.getElementById('deleteNodeButton'); // ดึงปุ่มสำหรับลบ node

// Variables for Dragging Nodes
let isDragging = false; // ตัวแปรสำหรับตรวจสอบว่ากำลังลาก node อยู่หรือไม่
let draggedNode = null; // ตัวแปรสำหรับเก็บ node ที่กำลังถูกลาก
let offsetX, offsetY; // ตัวแปรสำหรับเก็บ offset ของตำแหน่งการลาก

// Add event listeners for mouse interactions
canvas.addEventListener('mousedown', handleMouseDown); // เพิ่ม event listener สำหรับ mouse down
canvas.addEventListener('mousemove', handleMouseMove); // เพิ่ม event listener สำหรับ mouse move
canvas.addEventListener('mouseup', handleMouseUp); // เพิ่ม event listener สำหรับ mouse up
canvas.addEventListener('mouseleave', handleMouseUp); // เพิ่ม event listener สำหรับกรณีที่ mouse ออกจาก canvas
sourceSelect.addEventListener('change', () => {
    drawGraph(); // วาดกราฟใหม่เมื่อมีการเปลี่ยนแปลง source node
});

function handleMouseDown(e) {
    const mousePos = getMousePos(canvas, e); // หาตำแหน่งของ mouse บน canvas
    for (let [node, [x, y]] of positions.entries()) {
        if (isInsideNode(mousePos, x, y)) { // ตรวจสอบว่า mouse อยู่ภายใน node หรือไม่
            isDragging = true; // ตั้งค่าว่ากำลังลาก node
            draggedNode = node; // เก็บ node ที่กำลังถูกลาก
            offsetX = x - mousePos.x; // คำนวณ offset ของตำแหน่งการลาก
            offsetY = y - mousePos.y; // คำนวณ offset ของตำแหน่งการลาก
            break;
        }
    }
}

function handleMouseMove(e) {
    if (isDragging && draggedNode) { // ถ้ากำลังลาก node อยู่
        const mousePos = getMousePos(canvas, e); // หาตำแหน่งของ mouse บน canvas
        positions.set(draggedNode, [
            mousePos.x + offsetX,
            mousePos.y + offsetY
        ]); // อัพเดทตำแหน่งของ node ที่กำลังถูกลาก
        drawGraph(); // วาดกราฟใหม่
    }
}

function handleMouseUp(e) {
    if (isDragging) { // ถ้ากำลังลาก node อยู่
        isDragging = false; // ตั้งค่าว่าหยุดลาก node
        draggedNode = null; // ล้างค่า node ที่กำลังถูกลาก
    }
}

function getMousePos(canvas, evt) {
    const rect = canvas.getBoundingClientRect(); // หาตำแหน่งของ canvas บนหน้าจอ
    return {
        x: evt.clientX - rect.left, // คำนวณตำแหน่ง x ของ mouse บน canvas
        y: evt.clientY - rect.top // คำนวณตำแหน่ง y ของ mouse บน canvas
    };
}

function isInsideNode(pos, x, y) {
    const dx = pos.x - x; // คำนวณระยะห่างในแนว x
    const dy = pos.y - y; // คำนวณระยะห่างในแนว y
    return Math.sqrt(dx * dx + dy * dy) < 20; // ตรวจสอบว่า mouse อยู่ภายในรัศมีของ node หรือไม่ (สมมติว่ารัศมีของ node คือ 20)
}

// Helper function to draw an arrow from (fromx, fromy) to (tox, toy)
function drawArrow(fromx, fromy, tox, toy, color = 'black', lineWidth = 1) {
    const headLength = 10; // ความยาวของหัวลูกศร
    const dx = tox - fromx; // คำนวณระยะห่างในแนว x
    const dy = toy - fromy; // คำนวณระยะห่างในแนว y
    const angle = Math.atan2(dy, dx); // คำนวณมุมของลูกศร

    // วาดเส้นหลัก
    ctx.beginPath();
    ctx.moveTo(fromx, fromy);
    ctx.lineTo(tox, toy);
    ctx.strokeStyle = color; // ตั้งค่าสีของเส้น
    ctx.lineWidth = lineWidth; // ตั้งค่าความกว้างของเส้น
    ctx.stroke();

    // วาดหัวลูกศร
    ctx.beginPath();
    ctx.moveTo(tox, toy);
    ctx.lineTo(
        tox - headLength * Math.cos(angle - Math.PI / 6),
        toy - headLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
        tox - headLength * Math.cos(angle + Math.PI / 6),
        toy - headLength * Math.sin(angle + Math.PI / 6)
    );
    ctx.lineTo(tox, toy);
    ctx.fillStyle = color; // ตั้งค่าสีของหัวลูกศร
    ctx.fill();
}

function drawGraph(highlightPath = []) {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // ล้าง canvas

    // วาดเส้นเชื่อมพร้อมลูกศร
    graph.forEach(({ edges }, u) => {
        var offset_distance = 10; // ระยะห่างสำหรับการเลื่อนเส้นเชื่อมคู่ขนาน
        edges.forEach(({ v, weight }) => {
            var [x1, y1] = positions.get(u);
            var [x2, y2] = positions.get(v);

            // ตรวจสอบว่าเส้นเชื่อมนี้ควรถูกเน้นหรือไม่
            const edgeKey = `${u}-${v}`;
            const isHighlighted = highlightPath.includes(edgeKey);
            const color = isHighlighted ? 'red' : 'black';
            const lineWidth = isHighlighted ? 3 : 1;

            // คำนวณตำแหน่งการเลื่อนลูกศร
            var dx = x2 - x1;
            var dy = y2 - y1;
            var length = (dx ** 2 + dy ** 2) ** 0.5;

            // ปรับเวกเตอร์ทิศทางให้มีความยาวตามที่ต้องการ
            var arrow_length = 20;
            x2 = x2 - (dx / length) * arrow_length;
            y2 = y2 - (dy / length) * arrow_length;

            // คำนวณการเลื่อนในแนวตั้งฉาก
            var offset_x = -dy / length * offset_distance;
            var offset_y = dx / length * offset_distance;
            // ใช้การเลื่อนกับเส้นเชื่อม
            if (graph.get(v).edges.some(edge => edge.v === u)) {
                x1 += offset_x;
                y1 += offset_y;
                x2 += offset_x;
                y2 += offset_y;
            } else {
                x1 -= offset_x;
                y1 -= offset_y;
                x2 -= offset_x;
                y2 -= offset_y;
            }

            // วาดลูกศร
            drawArrow(x1, y1, x2, y2, color, lineWidth);

            // วาดน้ำหนักที่จุดกึ่งกลาง
            ctx.fillStyle = 'black';
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            // คำนวณระยะห่างจากเส้น 10
            offset_x = 10;
            offset_y = 10;
            ctx.fillText(weight, (x1 + x2) / 2, (y1 + y2) / 2 + offset_y);
        });
    });

    // ดึง source node ปัจจุบัน
    const source = sourceSelect.value;

    // วาด node
    positions.forEach(([x, y], node) => {
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, 2 * Math.PI);
        // เปลี่ยนสีถ้า node เป็น source
        if (node === source) {
            ctx.fillStyle = 'green';
        } else {
            ctx.fillStyle = 'lightblue';
        }
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = 'black';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node, x, y); // ลบการแสดงน้ำหนักของ node
    });
}

function addEdge() {
    const u = prompt('Enter start node:'); // รับค่า node เริ่มต้น
    const v = prompt('Enter end node:'); // รับค่า node ปลายทาง
    const weight = parseInt(prompt('Enter weight:'), 10); // รับค่าน้ำหนักของเส้นเชื่อม
    if (graph.has(u) && graph.has(v)) { // ตรวจสอบว่า node ทั้งสองมีอยู่ในกราฟหรือไม่
        graph.get(u).edges.push({ v, weight }); // เพิ่มเส้นเชื่อมในกราฟ
        drawGraph(); // วาดกราฟใหม่
    } else {
        alert('Invalid nodes'); // แจ้งเตือนถ้า node ไม่ถูกต้อง
    }
}

function runBellmanFord() {
    const source = sourceSelect.value; // ดึง source node
    const distances = new Map(); // สร้างแผนที่สำหรับเก็บระยะทาง
    const predecessors = new Map(); // สร้างแผนที่สำหรับเก็บ node ก่อนหน้า
    graph.forEach((nodeData, node) => {
        distances.set(node, Infinity); // ตั้งค่าระยะทางเริ่มต้นเป็น Infinity
    });
    distances.set(source, 0); // ตั้งค่าระยะทางของ source เป็น 0

    for (let i = 0; i < graph.size - 1; i++) {
        graph.forEach((nodeData, u) => {
            nodeData.edges.forEach(({ v, weight }) => {
                if (distances.get(u) + weight < distances.get(v)) {
                    distances.set(v, distances.get(u) + weight); // อัพเดทระยะทาง
                    predecessors.set(v, u); // อัพเดท node ก่อนหน้า
                }
            });
        });
    }

    console.log(distances);

    // ตรวจสอบวงจรน้ำหนักลบ
    let hasNegativeCycle = false;
    graph.forEach((nodeData, u) => {
        nodeData.edges.forEach(({ v, weight }) => {
            if (distances.get(u) + weight < distances.get(v)) {
                console.log("Negative Cycle Detected between", u, v);
                hasNegativeCycle = true;
            }
        });
    });

    if (hasNegativeCycle) {
        alert("Graph contains a negative-weight cycle"); // แจ้งเตือนถ้ามีวงจรน้ำหนักลบ
        return;
    }

    // สร้างเส้นทางใหม่
    const results = [];
    graph.forEach((_, node) => {
        const distance = distances.get(node); // ดึงระยะทางของ node
        const path = reconstructPath(predecessors, source, node); // สร้างเส้นทางจาก source ไปยัง node
        results.push({ name: node, distance: distance, path: path }); // เก็บผลลัพธ์
    });

    displayResultsTable(results); // แสดงผลลัพธ์ในตาราง
    drawGraph(predecessorsToHighlight(predecessors)); // วาดกราฟพร้อมเน้นเส้นทาง
}

// Function to add a custom node with name and weight
function addCustomNode() {
    const name = nodeNameInput.value.trim(); // ดึงชื่อ node จาก input

    if (!name) {
        alert('Node name cannot be empty.'); // แจ้งเตือนถ้าชื่อ node ว่าง
        return;
    }

    if (graph.has(name)) {
        alert('Node with this name already exists.'); // แจ้งเตือนถ้ามี node ชื่อนี้อยู่แล้ว
        return;
    }

    graph.set(name, { edges: [] }); // เพิ่ม node ในกราฟ

    // ตั้งค่าตำแหน่งอัตโนมัติในวงกลม
    const totalNodes = graph.size;
    const angle = (2 * Math.PI / totalNodes) * (totalNodes - 1);
    const radius = Math.min(canvas.width, canvas.height) / 3;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);

    positions.set(name, [x, y]); // ตั้งค่าตำแหน่งของ node

    const option = document.createElement('option');
    option.value = name;
    option.text = name;
    sourceSelect.add(option); // เพิ่ม node ใน select ของ source
    deleteNodeSelect.add(option.cloneNode(true)); // เพิ่ม node ใน select ของ delete

    drawGraph(); // วาดกราฟใหม่
    nodeNameInput.value = ''; // ล้างค่า input
}

// Function to delete a selected node
function deleteSelectedNode() {
    const node = deleteNodeSelect.value; // ดึง node ที่จะลบ
    if (!node) {
        alert('No node selected.'); // แจ้งเตือนถ้าไม่มี node ถูกเลือก
        return;
    }

    // ลบ node จากกราฟ
    graph.delete(node);
    positions.delete(node);

    // ลบเส้นเชื่อมที่เกี่ยวข้องกับ node
    graph.forEach((nodeData, u) => {
        nodeData.edges = nodeData.edges.filter(edge => edge.v !== node);
    });

    // ลบเส้นเชื่อมย้อนกลับ
    graph.forEach((nodeData, u) => {
        nodeData.edges = nodeData.edges.filter(edge => edge.v !== node); // ตรวจสอบให้แน่ใจว่าเส้นเชื่อมทั้งหมดไปยัง node ที่ถูกลบถูกลบออก
    });

    // ลบจาก sourceSelect และ deleteNodeSelect
    for (let i = 0; i < sourceSelect.options.length; i++) {
        if (sourceSelect.options[i].value === node) {
            sourceSelect.remove(i);
            break;
        }
    }

    for (let i = 0; i < deleteNodeSelect.options.length; i++) {
        if (deleteNodeSelect.options[i].value === node) {
            deleteNodeSelect.remove(i);
            break;
        }
    }

    drawGraph(); // วาดกราฟใหม่
}

// Event Listeners for new buttons
addCustomNodeButton.addEventListener('click', addCustomNode); // เพิ่ม event listener สำหรับปุ่มเพิ่ม custom node
deleteNodeButton.addEventListener('click', deleteSelectedNode); // เพิ่ม event listener สำหรับปุ่มลบ node

// Existing Event Listeners
addEdgeButton.addEventListener('click', addEdge); // เพิ่ม event listener สำหรับปุ่มเพิ่มเส้นเชื่อม
runButton.addEventListener('click', runBellmanFord); // เพิ่ม event listener สำหรับปุ่ม run Bellman-Ford

// Helper function to reconstruct the path from source to a given node
function reconstructPath(predecessors, source, node) {
    if (node === source) {
        return source; // ถ้า node เป็น source ให้คืนค่า source
    }
    if (!predecessors.has(node)) {
        return "No path"; // ถ้าไม่มี node ก่อนหน้า ให้คืนค่า "No path"
    }
    const path = [];
    let current = node;
    while (current !== source) {
        path.unshift(current); // เพิ่ม node ปัจจุบันในเส้นทาง
        current = predecessors.get(current); // ดึง node ก่อนหน้า
        if (current === undefined) {
            return "No path"; // ถ้าไม่มี node ก่อนหน้า ให้คืนค่า "No path"
        }
    }
    path.unshift(source); // เพิ่ม source ในเส้นทาง
    return path.join(" -> "); // คืนค่าเส้นทางในรูปแบบ string
}

// Function to display the results in a table
function displayResultsTable(results) {
    const tableBody = document.querySelector('#resultsTable tbody'); // ดึง tbody ของตารางผลลัพธ์
    document.getElementById('resultsTable').style.visibility = 'visible'; // แสดงตารางผลลัพธ์
    tableBody.innerHTML = ''; // ล้างผลลัพธ์ก่อนหน้า

    results.forEach(result => {
        const row = document.createElement('tr'); // สร้างแถวใหม่

        const nameCell = document.createElement('td'); // สร้างเซลล์สำหรับชื่อ
        nameCell.textContent = result.name; // ตั้งค่าข้อความในเซลล์
        row.appendChild(nameCell); // เพิ่มเซลล์ในแถว

        const distanceCell = document.createElement('td'); // สร้างเซลล์สำหรับระยะทาง
        distanceCell.textContent = result.distance; // ตั้งค่าข้อความในเซลล์
        row.appendChild(distanceCell); // เพิ่มเซลล์ในแถว

        const pathCell = document.createElement('td'); // สร้างเซลล์สำหรับเส้นทาง
        pathCell.textContent = result.path; // ตั้งค่าข้อความในเซลล์
        row.appendChild(pathCell); // เพิ่มเซลล์ในแถว

        tableBody.appendChild(row); // เพิ่มแถวใน tbody
    });
}

// Function to convert predecessors map to highlightPath array for drawing
function predecessorsToHighlight(predecessors) {
    const highlightPath = [];
    predecessors.forEach((u, v) => {
        highlightPath.push(`${u}-${v}`); // เพิ่มเส้นเชื่อมใน highlightPath
    });
    return highlightPath; // คืนค่า highlightPath
}

// Initial Nodes
var initNodes = [
    {
        name: 'A',
        edges: []
    },
    {
        name: 'B',
        edges: [
            {
                edges: [
                    { v: 'C', weight: 2 },
                ]
            },
        ],
    },
    {
        name: 'C',
        edges: [
            { v: 'A', weight: -1 },
        ]
    },
];

// Initialize positions for initial nodes
// const totalNodes = initNodes.length; // จำนวน node ทั้งหมด
// const radius = Math.min(canvas.width, canvas.height) / 3; // รัศมีของวงกลมที่ใช้ในการจัดตำแหน่ง node
// const centerX = canvas.width / 2; // ตำแหน่ง x ของจุดศูนย์กลาง
// const centerY = canvas.height / 2; // ตำแหน่ง y ของจุดศูนย์กลาง

// initNodes.forEach((node, index) => {
//     graph.set(node.name, node); // เพิ่ม node ในกราฟ
//     const angle = (2 * Math.PI / totalNodes) * index; // คำนวณมุมสำหรับตำแหน่ง node
//     const x = centerX + radius * Math.cos(angle); // คำนวณตำแหน่ง x ของ node
//     const y = centerY + radius * Math.sin(angle); // คำนวณตำแหน่ง y ของ node
//     positions.set(node.name, [x, y]); // ตั้งค่าตำแหน่งของ node
// });

// initNodes.forEach(node => {
//     const option = document.createElement('option'); // สร้าง option ใหม่
//     option.value = node.name; // ตั้งค่า value ของ option
//     option.text = node.name; // ตั้งค่าข้อความของ option
//     sourceSelect.add(option); // เพิ่ม option ใน select ของ source
//     deleteNodeSelect.add(option.cloneNode(true)); // เพิ่ม option ใน select ของ delete
// });
// drawGraph(); // วาดกราฟ
