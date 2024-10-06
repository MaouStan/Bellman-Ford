document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('graphCanvas');
    const ctx = canvas.getContext('2d');
    const sourceSelect = document.getElementById('source');
    const runButton = document.getElementById('run');
    const addEdgeButton = document.getElementById('addEdge');

    let graph = new Map();
    let positions = new Map();
    let nodeCount = 0;

    const nodeNameInput = document.getElementById('nodeName');
    const addCustomNodeButton = document.getElementById('addCustomNode');

    const deleteNodeSelect = document.getElementById('deleteNode');
    const deleteNodeButton = document.getElementById('deleteNodeButton');

    let isDragging = false;
    let draggedNode = null;
    let offsetX, offsetY;

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseUp);
    sourceSelect.addEventListener('change', () => {
        drawGraph();
    });

    let selectedNode = null;

    function handleAddEdgeClick() {
        canvas.addEventListener('click', selectNodeForEdge);
        alert('Click on the source node, then the destination node.');
    }

    function selectNodeForEdge(e) {
        const mousePos = getMousePos(canvas, e);
        for (let [node, [x, y]] of positions.entries()) {
            if (isInsideNode(mousePos, x, y)) {
                if (!selectedNode) {
                    selectedNode = node;
                    alert(`Selected source node: ${node}. Now click on the destination node.`);
                } else {
                    const destinationNode = node;
                    if (selectedNode !== destinationNode) {
                        const weight = prompt(`Enter weight for edge from ${selectedNode} to ${destinationNode}:`);
                        if (weight !== null && !isNaN(weight)) {
                            graph.get(selectedNode).edges.push({ v: destinationNode, weight: parseInt(weight, 10) });
                            drawGraph();
                        } else {
                            alert('Invalid weight. Please try again.');
                        }
                    } else {
                        alert('Source and destination nodes cannot be the same. Please try again.');
                    }
                    selectedNode = null;
                    canvas.removeEventListener('click', selectNodeForEdge);
                }
                break;
            }
        }
    }

    addEdgeButton.addEventListener('click', handleAddEdgeClick);

    function handleMouseDown(e) {
        const mousePos = getMousePos(canvas, e);
        for (let [node, [x, y]] of positions.entries()) {
            if (isInsideNode(mousePos, x, y)) {
                isDragging = true;
                draggedNode = node;
                offsetX = x - mousePos.x;
                offsetY = y - mousePos.y;
                break;
            }
        }
    }

    function handleMouseMove(e) {
        if (isDragging && draggedNode) {
            const mousePos = getMousePos(canvas, e);
            positions.set(draggedNode, [
                mousePos.x + offsetX,
                mousePos.y + offsetY
            ]);
            drawGraph();
        }
    }

    function handleMouseUp(e) {
        if (isDragging) {
            isDragging = false;
            draggedNode = null;
        }
    }

    function getMousePos(canvas, evt) {
        const rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    }

    function isInsideNode(pos, x, y) {
        const dx = pos.x - x;
        const dy = pos.y - y;
        return Math.sqrt(dx * dx + dy * dy) < 20;
    }

    function drawArrow(fromx, fromy, tox, toy, color = 'black', lineWidth = 1) {
        const headLength = 10;
        const dx = tox - fromx;
        const dy = toy - fromy;
        const angle = Math.atan2(dy, dx);

        ctx.beginPath();
        ctx.moveTo(fromx, fromy);
        ctx.lineTo(tox, toy);
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.stroke();

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
        ctx.fillStyle = color;
        ctx.fill();
    }

    function drawGraph(highlightPath = []) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        graph.forEach(({ edges }, u) => {
            var offset_distance = 10;
            edges.forEach(({ v, weight }) => {
                var [x1, y1] = positions.get(u);
                var [x2, y2] = positions.get(v);

                const edgeKey = `${u}-${v}`;
                const isHighlighted = highlightPath.includes(edgeKey);
                const color = isHighlighted ? 'red' : 'black';
                const lineWidth = isHighlighted ? 3 : 1;

                var dx = x2 - x1;
                var dy = y2 - y1;
                var length = (dx ** 2 + dy ** 2) ** 0.5;

                var arrow_length = 20;
                x2 = x2 - (dx / length) * arrow_length;
                y2 = y2 - (dy / length) * arrow_length;

                var offset_x = -dy / length * offset_distance;
                var offset_y = dx / length * offset_distance;

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

                drawArrow(x1, y1, x2, y2, color, lineWidth);

                ctx.fillStyle = 'black';
                ctx.font = '14px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                offset_x = 10;
                offset_y = 10;
                ctx.fillText(weight, (x1 + x2) / 2, (y1 + y2) / 2 + offset_y);
            });
        });

        const source = sourceSelect.value;

        positions.forEach(([x, y], node) => {
            ctx.beginPath();
            ctx.arc(x, y, 20, 0, 2 * Math.PI);

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
            ctx.fillText(node, x, y);
        });
    }

    function runBellmanFord() {
        const source = sourceSelect.value;
        const distances = new Map();
        const predecessors = new Map();
        graph.forEach((nodeData, node) => {
            distances.set(node, Infinity);
        });
        distances.set(source, 0);

        for (let i = 0; i < graph.size - 1; i++) {
            graph.forEach((nodeData, u) => {
                nodeData.edges.forEach(({ v, weight }) => {
                    if (distances.get(u) + weight < distances.get(v)) {
                        distances.set(v, distances.get(u) + weight);
                        predecessors.set(v, u);
                    }
                });
            });
        }

        console.log(distances);

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
            alert("Graph contains a negative-weight cycle");
            return;
        }

        const results = [];
        graph.forEach((_, node) => {
            const distance = distances.get(node);
            const path = reconstructPath(predecessors, source, node);
            results.push({ name: node, distance: distance, path: path });
        });

        displayResultsTable(results);
        drawGraph(predecessorsToHighlight(predecessors));
    }

    function addCustomNode() {
        const name = nodeNameInput.value.trim();

        if (!name) {
            alert('Node name cannot be empty.');
            return;
        }

        if (graph.has(name)) {
            alert('Node with this name already exists.');
            return;
        }

        graph.set(name, { edges: [] });

        const totalNodes = graph.size;
        const angle = (2 * Math.PI / totalNodes) * (totalNodes - 1);
        const radius = Math.min(canvas.width, canvas.height) / 3;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);

        positions.set(name, [x, y]);

        const option = document.createElement('option');
        option.value = name;
        option.text = name;
        sourceSelect.add(option);
        deleteNodeSelect.add(option.cloneNode(true));

        drawGraph();
        nodeNameInput.value = '';
    }

    function deleteSelectedNode() {
        const node = deleteNodeSelect.value;
        if (!node) {
            alert('No node selected.');
            return;
        }

        graph.delete(node);
        positions.delete(node);

        graph.forEach((nodeData, u) => {
            nodeData.edges = nodeData.edges.filter(edge => edge.v !== node);
        });

        graph.forEach((nodeData, u) => {
            nodeData.edges = nodeData.edges.filter(edge => edge.v !== node);
        });

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

        drawGraph();
    }

    addCustomNodeButton.addEventListener('click', addCustomNode);
    deleteNodeButton.addEventListener('click', deleteSelectedNode);

    addEdgeButton.addEventListener('click', addEdge);
    runButton.addEventListener('click', runBellmanFord);

    function reconstructPath(predecessors, source, node) {
        if (node === source) {
            return source;
        }
        if (!predecessors.has(node)) {
            return "No path";
        }
        const path = [];
        let current = node;
        while (current !== source) {
            path.unshift(current);
            current = predecessors.get(current);
            if (current === undefined) {
                return "No path";
            }
        }
        path.unshift(source);
        return path.join(" -> ");
    }

    function displayResultsTable(results) {
        const tableBody = document.querySelector('#resultsTable tbody');
        document.getElementById('resultsTable').style.visibility = 'visible';
        tableBody.innerHTML = '';

        results.forEach(result => {
            const row = document.createElement('tr');

            const nameCell = document.createElement('td');
            nameCell.textContent = result.name;
            row.appendChild(nameCell);

            const distanceCell = document.createElement('td');
            distanceCell.textContent = result.distance;
            row.appendChild(distanceCell);

            const pathCell = document.createElement('td');
            pathCell.textContent = result.path;
            row.appendChild(pathCell);

            tableBody.appendChild(row);
        });
    }

    function predecessorsToHighlight(predecessors) {
        const highlightPath = [];
        predecessors.forEach((u, v) => {
            highlightPath.push(`${u}-${v}`);
        });
        return highlightPath;
    }

    const importMatrixButton = document.getElementById('importMatrix');
    const importListButton = document.getElementById('importList');

    importMatrixButton.addEventListener('click', () => {
        $('#matrixModal').modal('show');
    });

    importListButton.addEventListener('click', () => {
        $('#listModal').modal('show');
    });

    document.getElementById('submitMatrix').addEventListener('click', () => {
        const matrixInput = document.getElementById('matrixInput').value;
        importFromMatrix(matrixInput);
        $('#matrixModal').modal('hide');
    });

    document.getElementById('submitList').addEventListener('click', () => {
        const listInput = document.getElementById('listInput').value;
        importFromList(listInput);
        $('#listModal').modal('hide');
    });

    function importFromMatrix(matrixInput) {
        try {
            const matrix = JSON.parse(matrixInput.replace(/(\d+),/g, '$1,').replace(/(\d+)\}/g, '$1}'));
            const nodeNames = generateNodeNames(matrix.length);

            graph.clear();
            positions.clear();
            nodeNames.forEach((name, index) => {
                graph.set(name, { edges: [] });
                for (let j = 0; j < matrix[index].length; j++) {
                    if (matrix[index][j] !== 0) {
                        graph.get(name).edges.push({ v: nodeNames[j], weight: matrix[index][j] });
                    }
                }
            });

            updateNodePositionsAndSelects(nodeNames);
            drawGraph();
        } catch (error) {
            alert('Invalid matrix format.');
        }
    }

    function importFromList(listInput) {
        try {
            const edges = listInput.split(',').map(edge => edge.trim());
            graph.clear();
            positions.clear();

            edges.forEach(edge => {
                const match = edge.match(/(\w+)-\((\d+)\)-(\w+)/);
                if (match) {
                    const [_, start, weight, end] = match;
                    if (!graph.has(start)) graph.set(start, { edges: [] });
                    if (!graph.has(end)) graph.set(end, { edges: [] });
                    
                    // Add edge from start to end
                    graph.get(start).edges.push({ v: end, weight: parseInt(weight, 10) });
                    
                    // Add edge from end to start if not already present
                    if (!graph.get(end).edges.some(edge => edge.v === start)) {
                        graph.get(end).edges.push({ v: start, weight: parseInt(weight, 10) });
                    }
                } else {
                    throw new Error('Invalid format');
                }
            });

            const nodeNames = Array.from(graph.keys());
            updateNodePositionsAndSelects(nodeNames);
            drawGraph();
        } catch (error) {
            alert('Invalid list format.');
        }
    }

    function generateNodeNames(count) {
        const names = [];
        for (let i = 0; i < count; i++) {
            let name = '';
            let n = i;
            while (n >= 0) {
                name = String.fromCharCode((n % 26) + 65) + name;
                n = Math.floor(n / 26) - 1;
            }
            names.push(name);
        }
        return names;
    }

    function updateNodePositionsAndSelects(nodeNames) {
        const totalNodes = nodeNames.length;
        const radius = Math.min(canvas.width, canvas.height) / 3;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        nodeNames.forEach((name, index) => {
            const angle = (2 * Math.PI / totalNodes) * index;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            positions.set(name, [x, y]);

            const option = document.createElement('option');
            option.value = name;
            option.text = name;
            sourceSelect.add(option);
            deleteNodeSelect.add(option.cloneNode(true));
        });
    }
});
