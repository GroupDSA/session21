// Modern Graph Theory Application with Advanced Features

// ===== CONFIGURATION & CONSTANTS =====
const CONFIG = {
    ANIMATION_SPEED: 1000,
    THEMES: {
        cyber: { primary: '#00f5ff', secondary: '#ff006e' },
        neon: { primary: '#39ff14', secondary: '#ff073a' },
        ocean: { primary: '#667eea', secondary: '#764ba2' }
    },
    CANVAS: {
        width: 600,
        height: 400,
        nodeRadius: 25,
        edgeWidth: 3
    }
};

// ===== MODERN GRAPH CLASS =====
class ModernGraph {
    constructor() {
        this.adjacencyList = {};
        this.nodes = new Map();
        this.edges = [];
        this.animationSpeed = CONFIG.ANIMATION_SPEED;
        this.currentTheme = 'cyber';
        this.isAnimating = false;
    }

    addVertex(vertex, position = null) {
        if (!this.adjacencyList[vertex]) {
            this.adjacencyList[vertex] = [];
            this.nodes.set(vertex, {
                id: vertex,
                position: position || this.generateRandomPosition(),
                color: CONFIG.THEMES[this.currentTheme].primary,
                visited: false,
                distance: Infinity,
                previous: null
            });
        }
    }

    addEdge(vertex1, vertex2, weight = 1) {
        if (!this.adjacencyList[vertex1] || !this.adjacencyList[vertex2]) return;
        
        this.adjacencyList[vertex1].push({ node: vertex2, weight });
        this.adjacencyList[vertex2].push({ node: vertex1, weight });
        
        this.edges.push({
            from: vertex1,
            to: vertex2,
            weight,
            animated: false
        });
    }

    generateRandomPosition() {
        return {
            x: Math.random() * (CONFIG.CANVAS.width - 100) + 50,
            y: Math.random() * (CONFIG.CANVAS.height - 100) + 50
        };
    }

    // Advanced DFS with detailed tracking
    async dfsAdvanced(start, callback, stepCallback) {
        const visited = new Set();
        const result = [];
        const steps = [];
        const stack = [{ node: start, path: [start] }];
        
        while (stack.length > 0) {
            const { node, path } = stack.pop();
            
            if (!visited.has(node)) {
                await this.processNode(node, path, visited, result, steps, callback, stepCallback);
                await this.addNeighborsToStack(node, path, visited, stack, steps);
            }
            
            // Add delay for animation
            await new Promise(resolve => setTimeout(resolve, this.animationSpeed));
        }
        
        return { result, steps, visited };
    }

    async processNode(node, path, visited, result, steps, callback, stepCallback) {
        visited.add(node);
        result.push(node);
        steps.push({
            type: 'visit',
            node,
            message: `Thăm đỉnh ${node}`,
            path: [...path],
            stackState: []
        });
        
        if (callback) await callback(node, 'visited');
        if (stepCallback) stepCallback(steps[steps.length - 1]);
    }

    async addNeighborsToStack(node, path, visited, stack, steps) {
        const neighbors = this.adjacencyList[node]
            .map(edge => edge.node || edge)
            .filter(neighbor => !visited.has(neighbor))
            .reverse();
        
        for (const neighbor of neighbors) {
            if (!visited.has(neighbor)) {
                stack.push({ node: neighbor, path: [...path, neighbor] });
                steps.push({
                    type: 'discover',
                    node: neighbor,
                    message: `Phát hiện đỉnh ${neighbor} từ ${node}`,
                    stackState: [...stack.map(item => item.node)]
                });
            }
        }
    }

    // Advanced BFS with level tracking
    async bfsAdvanced(start, callback, stepCallback) {
        const visited = new Set();
        const queue = [{ node: start, level: 0, path: [start] }];
        const result = [];
        const steps = [];
        const levels = new Map();
        
        visited.add(start);
        levels.set(start, 0);
        
        while (queue.length > 0) {
            const { node, level, path } = queue.shift();
            result.push(node);
            
            steps.push({
                type: 'visit',
                node,
                level,
                message: `Thăm đỉnh ${node} ở level ${level}`,
                path: [...path],
                queueState: [...queue.map(item => `${item.node}(L${item.level})`)]
            });
            
            if (callback) await callback(node, 'visited', level);
            if (stepCallback) stepCallback(steps[steps.length - 1]);
            
            // Add neighbors to queue
            for (const edge of this.adjacencyList[node]) {
                const neighbor = edge.node || edge;
                if (!visited.has(neighbor)) {
                    visited.add(neighbor);
                    levels.set(neighbor, level + 1);
                    queue.push({ 
                        node: neighbor, 
                        level: level + 1, 
                        path: [...path, neighbor] 
                    });
                    
                    steps.push({
                        type: 'discover',
                        node: neighbor,
                        level: level + 1,
                        message: `Thêm ${neighbor} vào queue (level ${level + 1})`,
                        queueState: [...queue.map(item => `${item.node}(L${item.level})`)]
                    });
                }
            }
            
            // Add delay for animation
            await new Promise(resolve => setTimeout(resolve, this.animationSpeed));
        }
        
        return { result, steps, levels, visited };
    }

    // Dijkstra's algorithm for shortest path
    async dijkstra(start, end = null) {
        const distances = new Map();
        const previous = new Map();
        const visited = new Set();
        const priorityQueue = [{ node: start, distance: 0 }];
        
        // Initialize distances
        for (const vertex of Object.keys(this.adjacencyList)) {
            distances.set(vertex, vertex === start ? 0 : Infinity);
            previous.set(vertex, null);
        }
        
        while (priorityQueue.length > 0) {
            // Sort queue by distance (simple implementation)
            priorityQueue.sort((a, b) => a.distance - b.distance);
            const { node: current, distance: currentDist } = priorityQueue.shift();
            
            if (visited.has(current)) continue;
            visited.add(current);
            
            if (current === end) break;
            
            // Update distances to neighbors
            for (const edge of this.adjacencyList[current]) {
                const neighbor = edge.node || edge;
                const weight = edge.weight || 1;
                const newDist = currentDist + weight;
                
                if (newDist < distances.get(neighbor)) {
                    distances.set(neighbor, newDist);
                    previous.set(neighbor, current);
                    priorityQueue.push({ node: neighbor, distance: newDist });
                }
            }
        }
        
        return { distances, previous, visited };
    }

    // Reset graph state
    reset() {
        this.nodes.forEach(node => {
            node.visited = false;
            node.color = CONFIG.THEMES[this.currentTheme].primary;
            node.distance = Infinity;
            node.previous = null;
        });
        
        this.edges.forEach(edge => {
            edge.animated = false;
        });
        
        this.isAnimating = false;
    }

    // Change theme
    setTheme(theme) {
        if (CONFIG.THEMES[theme]) {
            this.currentTheme = theme;
            document.documentElement.style.setProperty('--text-accent', CONFIG.THEMES[theme].primary);
        }
    }
}

// ===== ADVANCED CANVAS RENDERER =====
class GraphRenderer {
    constructor(canvasId, graph) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.graph = graph;
        this.scale = 1;
        this.offset = { x: 0, y: 0 };
        this.animatedNodes = new Set();
        this.animatedEdges = new Set();
        
        this.setupEventListeners();
        this.render();
    }

    setupEventListeners() {
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('wheel', (e) => this.handleZoom(e));
    }

    handleCanvasClick(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = (event.clientX - rect.left) / this.scale - this.offset.x;
        const y = (event.clientY - rect.top) / this.scale - this.offset.y;
        
        // Check if click is on a node
        for (const [nodeId, node] of this.graph.nodes) {
            const distance = Math.sqrt((x - node.position.x) ** 2 + (y - node.position.y) ** 2);
            if (distance <= CONFIG.CANVAS.nodeRadius) {
                document.getElementById('startNode').value = nodeId;
                this.highlightNode(nodeId, '#f39c12');
                break;
            }
        }
    }

    handleMouseMove(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = (event.clientX - rect.left) / this.scale - this.offset.x;
        const y = (event.clientY - rect.top) / this.scale - this.offset.y;
        
        let hoveredNode = null;
        for (const [nodeId, node] of this.graph.nodes) {
            const distance = Math.sqrt((x - node.position.x) ** 2 + (y - node.position.y) ** 2);
            if (distance <= CONFIG.CANVAS.nodeRadius) {
                hoveredNode = nodeId;
                break;
            }
        }
        
        this.canvas.style.cursor = hoveredNode ? 'pointer' : 'default';
        
        // Show node info
        const nodeInfo = document.getElementById('nodeInfo');
        if (hoveredNode) {
            const node = this.graph.nodes.get(hoveredNode);
            nodeInfo.textContent = `Node: ${hoveredNode} | Visited: ${node.visited}`;
            nodeInfo.style.opacity = '1';
        } else {
            nodeInfo.style.opacity = '0';
        }
    }

    handleZoom(event) {
        event.preventDefault();
        const zoom = event.deltaY > 0 ? 0.9 : 1.1;
        this.scale = Math.max(0.5, Math.min(2, this.scale * zoom));
        this.render();
    }

    render() {
        this.ctx.save();
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.scale(this.scale, this.scale);
        this.ctx.translate(this.offset.x, this.offset.y);
        
        this.drawGrid();
        this.drawEdges();
        this.drawNodes();
        
        this.ctx.restore();
    }

    drawGrid() {
        const gridSize = 50;
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        this.ctx.lineWidth = 1;
        
        for (let x = 0; x < this.canvas.width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        for (let y = 0; y < this.canvas.height; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }

    drawEdges() {
        this.graph.edges.forEach(edge => {
            const fromNode = this.graph.nodes.get(edge.from);
            const toNode = this.graph.nodes.get(edge.to);
            
            if (!fromNode || !toNode) return;
            
            this.ctx.strokeStyle = edge.animated ? '#64ffda' : 'rgba(255, 255, 255, 0.3)';
            this.ctx.lineWidth = edge.animated ? 4 : 2;
            
            if (edge.animated) {
                this.ctx.shadowColor = '#64ffda';
                this.ctx.shadowBlur = 10;
            }
            
            this.ctx.beginPath();
            this.ctx.moveTo(fromNode.position.x, fromNode.position.y);
            this.ctx.lineTo(toNode.position.x, toNode.position.y);
            this.ctx.stroke();
            
            this.ctx.shadowBlur = 0;
            
            // Draw weight if exists
            if (edge.weight && edge.weight !== 1) {
                const midX = (fromNode.position.x + toNode.position.x) / 2;
                const midY = (fromNode.position.y + toNode.position.y) / 2;
                
                this.ctx.fillStyle = '#64ffda';
                this.ctx.font = '12px JetBrains Mono';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(edge.weight.toString(), midX, midY);
            }
        });
    }

    drawNodes() {
        this.graph.nodes.forEach((node, nodeId) => {
            const gradient = this.ctx.createRadialGradient(
                node.position.x, node.position.y, 0,
                node.position.x, node.position.y, CONFIG.CANVAS.nodeRadius
            );
            
            if (node.visited) {
                gradient.addColorStop(0, '#27ae60');
                gradient.addColorStop(1, '#2ecc71');
            } else {
                gradient.addColorStop(0, node.color);
                gradient.addColorStop(1, node.color + '80');
            }
            
            // Draw node glow if animated
            if (this.animatedNodes.has(nodeId)) {
                this.ctx.shadowColor = node.color;
                this.ctx.shadowBlur = 20;
            }
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(node.position.x, node.position.y, CONFIG.CANVAS.nodeRadius, 0, 2 * Math.PI);
            this.ctx.fill();
            
            // Draw border
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            
            this.ctx.shadowBlur = 0;
            
            // Draw label
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = 'bold 16px Inter';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(nodeId, node.position.x, node.position.y);
        });
    }

    async highlightNode(nodeId, color = '#e74c3c', duration = 1000) {
        const node = this.graph.nodes.get(nodeId);
        if (!node) return;
        
        node.color = color;
        node.visited = true;
        this.animatedNodes.add(nodeId);
        
        this.render();
        
        setTimeout(() => {
            this.animatedNodes.delete(nodeId);
            this.render();
        }, duration);
    }

    async animateEdge(from, to, duration = 500) {
        const edge = this.graph.edges.find(e => 
            (e.from === from && e.to === to) || (e.from === to && e.to === from)
        );
        
        if (edge) {
            edge.animated = true;
            this.render();
            
            setTimeout(() => {
                edge.animated = false;
                this.render();
            }, duration);
        }
    }

    center() {
        this.offset = { x: 0, y: 0 };
        this.scale = 1;
        this.render();
    }

    zoomIn() {
        this.scale = Math.min(2, this.scale * 1.2);
        this.render();
    }

    zoomOut() {
        this.scale = Math.max(0.5, this.scale / 1.2);
        this.render();
    }
}

// ===== APPLICATION STATE MANAGER =====
class AppState {
    constructor() {
        this.currentAlgorithm = null;
        this.isRunning = false;
        this.startTime = null;
        this.statistics = {
            visitedNodes: 0,
            elapsedTime: 0,
            currentStep: 0
        };
    }

    startAlgorithm(algorithmName) {
        this.currentAlgorithm = algorithmName;
        this.isRunning = true;
        this.startTime = Date.now();
        this.statistics = {
            visitedNodes: 0,
            elapsedTime: 0,
            currentStep: 0
        };
        this.updateUI();
    }

    updateStatistics(visitedCount, step) {
        this.statistics.visitedNodes = visitedCount;
        this.statistics.currentStep = step;
        this.statistics.elapsedTime = Date.now() - this.startTime;
        this.updateUI();
    }

    stopAlgorithm() {
        this.isRunning = false;
        this.currentAlgorithm = null;
        this.updateUI();
    }

    updateUI() {
        document.getElementById('visitedCount').textContent = this.statistics.visitedNodes;
        document.getElementById('elapsedTime').textContent = `${this.statistics.elapsedTime}ms`;
        document.getElementById('currentStep').textContent = this.statistics.currentStep;
    }

    reset() {
        this.statistics = {
            visitedNodes: 0,
            elapsedTime: 0,
            currentStep: 0
        };
        this.updateUI();
    }
}

// ===== MAIN APPLICATION =====
class GraphApp {
    constructor() {
        this.graph = new ModernGraph();
        this.renderer = null;
        this.appState = new AppState();
        this.currentResults = null;
        
        this.initializeGraph();
        this.setupEventListeners();
        this.initializeParticles();
        this.setupLoadingScreen();
    }

    initializeGraph() {
        // Create sample graph
        const positions = {
            'A': { x: 150, y: 100 },
            'B': { x: 300, y: 50 },
            'C': { x: 300, y: 150 },
            'D': { x: 450, y: 50 },
            'E': { x: 450, y: 150 }
        };

        ['A', 'B', 'C', 'D', 'E'].forEach(vertex => {
            this.graph.addVertex(vertex, positions[vertex]);
        });

        this.graph.addEdge('A', 'B');
        this.graph.addEdge('A', 'C');
        this.graph.addEdge('B', 'D');
        this.graph.addEdge('C', 'E');
        this.graph.addEdge('D', 'E');
        this.graph.addEdge('B', 'C'); // Additional edge for more interesting traversal

        // Initialize renderer after DOM is loaded
        setTimeout(() => {
            this.renderer = new GraphRenderer('graphCanvas', this.graph);
        }, 100);
    }

    setupEventListeners() {
        // Algorithm buttons
        document.getElementById('dfsBtn')?.addEventListener('click', () => this.runDFS());
        document.getElementById('bfsBtn')?.addEventListener('click', () => this.runBFS());
        document.getElementById('resetBtn')?.addEventListener('click', () => this.reset());

        // Controls
        document.getElementById('speed')?.addEventListener('input', (e) => {
            this.graph.animationSpeed = parseInt(e.target.value);
            document.querySelector('.slider-value').textContent = `${e.target.value}ms`;
        });

        // Theme selector
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.graph.setTheme(e.target.dataset.theme);
                this.renderer?.render();
            });
        });

        // Result tabs
        document.querySelectorAll('.result-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                document.querySelectorAll('.result-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.result-panel').forEach(p => p.classList.remove('active'));
                
                e.target.classList.add('active');
                document.getElementById(`${e.target.dataset.tab}-panel`).classList.add('active');
            });
        });

        // Graph controls
        document.getElementById('zoomIn')?.addEventListener('click', () => this.renderer?.zoomIn());
        document.getElementById('zoomOut')?.addEventListener('click', () => this.renderer?.zoomOut());
        document.getElementById('centerGraph')?.addEventListener('click', () => this.renderer?.center());

        // Navigation
        this.setupSmoothScrolling();
        this.setupProgressBar();

        // FAB buttons
        document.getElementById('themeToggle')?.addEventListener('click', () => this.toggleTheme());
        document.getElementById('fullscreenBtn')?.addEventListener('click', () => this.toggleFullscreen());
        document.getElementById('scrollToTop')?.addEventListener('click', () => this.scrollToTop());

        // Copy code buttons
        document.querySelectorAll('.copy-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.copyCode(e.target));
        });

        // Tab switching for algorithms
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                
                e.target.classList.add('active');
                document.getElementById(`${e.target.dataset.tab}-tab`).classList.add('active');
            });
        });
    }

    async runDFS() {
        if (this.graph.isAnimating) return;
        
        this.graph.isAnimating = true;
        this.appState.startAlgorithm('DFS');
        this.graph.reset();
        this.renderer.render();
        
        const startNode = document.getElementById('startNode').value;
        const results = [];
        
        try {
            const { result, steps } = await this.graph.dfsAdvanced(
                startNode,
                async (node, status, level) => {
                    await this.renderer.highlightNode(node, '#27ae60', this.graph.animationSpeed);
                    this.appState.updateStatistics(results.length + 1, steps.length);
                },
                (step) => this.updateStepDisplay(step)
            );
            
            this.displayResults('DFS', result, steps);
            this.currentResults = { algorithm: 'DFS', result, steps };
            
        } catch (error) {
            console.error('Error running DFS:', error);
        } finally {
            this.graph.isAnimating = false;
            this.appState.stopAlgorithm();
        }
    }

    async runBFS() {
        if (this.graph.isAnimating) return;
        
        this.graph.isAnimating = true;
        this.appState.startAlgorithm('BFS');
        this.graph.reset();
        this.renderer.render();
        
        const startNode = document.getElementById('startNode').value;
        
        try {
            const { result, steps, levels } = await this.graph.bfsAdvanced(
                startNode,
                async (node, status, level) => {
                    await this.renderer.highlightNode(node, '#3498db', this.graph.animationSpeed);
                    this.appState.updateStatistics(result.length, steps.length);
                },
                (step) => this.updateStepDisplay(step)
            );
            
            this.displayResults('BFS', result, steps);
            this.currentResults = { algorithm: 'BFS', result, steps, levels };
            
        } catch (error) {
            console.error('Error running BFS:', error);
        } finally {
            this.graph.isAnimating = false;
            this.appState.stopAlgorithm();
        }
    }

    displayResults(algorithm, result, steps) {
        const traversalDiv = document.getElementById('traversalResult');
        const stepsDiv = document.getElementById('stepByStep');
        const codeDiv = document.getElementById('codeExecution');
        
        // Display traversal result
        traversalDiv.innerHTML = `
            <div class="result-header">
                <h4><i class="fas fa-route"></i> ${algorithm} Traversal Result</h4>
            </div>
            <div class="result-path">
                ${result.map((node, index) => 
                    `<span class="path-node" style="animation-delay: ${index * 0.1}s">${node}</span>`
                ).join('<i class="fas fa-arrow-right path-arrow"></i>')}
            </div>
            <div class="result-stats">
                <span class="stat"><i class="fas fa-clock"></i> Time: ${this.appState.statistics.elapsedTime}ms</span>
                <span class="stat"><i class="fas fa-map-marker"></i> Nodes: ${result.length}</span>
                <span class="stat"><i class="fas fa-list"></i> Steps: ${steps.length}</span>
            </div>
        `;
        
        // Display step-by-step
        stepsDiv.innerHTML = `
            <div class="steps-header">
                <h4><i class="fas fa-list-ol"></i> Execution Steps</h4>
            </div>
            <div class="steps-list">
                ${steps.map((step, index) => `
                    <div class="step-item ${step.type}" data-step="${index}">
                        <div class="step-number">${index + 1}</div>
                        <div class="step-content">
                            <div class="step-message">${step.message}</div>
                            ${step.stackState ? `<div class="step-state">Stack: [${step.stackState.join(', ')}]</div>` : ''}
                            ${step.queueState ? `<div class="step-state">Queue: [${step.queueState.join(', ')}]</div>` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        
        // Display code execution
        codeDiv.innerHTML = `
            <div class="code-header">
                <h4><i class="fas fa-code"></i> Code Execution Trace</h4>
            </div>
            <pre class="execution-trace">
                <code class="language-javascript">${this.generateCodeTrace(algorithm, result, steps)}</code>
            </pre>
        `;
        
        // Trigger animations
        setTimeout(() => {
            document.querySelectorAll('.path-node').forEach((node, index) => {
                setTimeout(() => node.classList.add('animated'), index * 100);
            });
        }, 100);
    }

    generateCodeTrace(algorithm, result, steps) {
        if (algorithm === 'DFS') {
            return `// DFS Execution Trace
function dfs(graph, start = '${result[0]}') {
    const visited = new Set();
    const stack = ['${result[0]}'];
    
    while (stack.length > 0) {
        const vertex = stack.pop();
        
        if (!visited.has(vertex)) {
            visited.add(vertex);
            console.log('Visited: ' + vertex);
            
            // Add neighbors to stack
            graph[vertex].forEach(neighbor => {
                if (!visited.has(neighbor)) {
                    stack.push(neighbor);
                }
            });
        }
    }
    
    return [${result.map(r => `'${r}'`).join(', ')}];
}`;
        } else {
            return `// BFS Execution Trace
function bfs(graph, start = '${result[0]}') {
    const visited = new Set();
    const queue = ['${result[0]}'];
    const result = [];
    
    visited.add('${result[0]}');
    
    while (queue.length > 0) {
        const vertex = queue.shift();
        result.push(vertex);
        console.log('Visited: ' + vertex);
        
        // Add neighbors to queue
        graph[vertex].forEach(neighbor => {
            if (!visited.has(neighbor)) {
                visited.add(neighbor);
                queue.push(neighbor);
            }
        });
    }
    
    return [${result.map(r => `'${r}'`).join(', ')}];
}`;
        }
    }

    updateStepDisplay(step) {
        // Real-time step updates could go here
        console.log('Step:', step.message);
    }

    reset() {
        this.graph.reset();
        this.appState.reset();
        this.renderer?.render();
        
        // Clear results
        document.getElementById('traversalResult').innerHTML = '<div class="placeholder">Click an algorithm button to see results</div>';
        document.getElementById('stepByStep').innerHTML = '<div class="placeholder">Step-by-step execution will appear here</div>';
        document.getElementById('codeExecution').innerHTML = '<div class="placeholder">Code execution trace will appear here</div>';
        
        this.currentResults = null;
    }

    setupSmoothScrolling() {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(link.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    
                    // Update active nav link
                    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                    link.classList.add('active');
                }
            });
        });
    }

    setupProgressBar() {
        window.addEventListener('scroll', () => {
            const scrolled = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
            document.querySelector('.nav-progress').style.width = `${scrolled}%`;
        });
    }

    initializeParticles() {
        if (typeof particlesJS !== 'undefined') {
            particlesJS('particles-js', {
                particles: {
                    number: { value: 50 },
                    color: { value: '#64ffda' },
                    shape: { type: 'circle' },
                    opacity: { value: 0.3 },
                    size: { value: 3, random: true },
                    line_linked: {
                        enable: true,
                        distance: 150,
                        color: '#64ffda',
                        opacity: 0.2,
                        width: 1
                    },
                    move: {
                        enable: true,
                        speed: 2,
                        direction: 'none',
                        random: false,
                        straight: false,
                        out_mode: 'out',
                        bounce: false
                    }
                },
                interactivity: {
                    detect_on: 'canvas',
                    events: {
                        onhover: { enable: true, mode: 'repulse' },
                        onclick: { enable: true, mode: 'push' },
                        resize: true
                    }
                },
                retina_detect: true
            });
        }
    }

    setupLoadingScreen() {
        window.addEventListener('load', () => {
            setTimeout(() => {
                document.getElementById('loading-screen').classList.add('hidden');
            }, 2000);
        });
    }

    copyCode(button) {
        const codeBlock = button.parentElement.nextElementSibling.querySelector('code');
        const text = codeBlock.textContent;
        
        navigator.clipboard.writeText(text).then(() => {
            const originalIcon = button.innerHTML;
            button.innerHTML = '<i class="fas fa-check"></i>';
            button.style.color = '#27ae60';
            
            setTimeout(() => {
                button.innerHTML = originalIcon;
                button.style.color = '';
            }, 2000);
        });
    }

    toggleTheme() {
        const themes = ['cyber', 'neon', 'ocean'];
        const currentIndex = themes.indexOf(this.graph.currentTheme);
        const nextTheme = themes[(currentIndex + 1) % themes.length];
        this.graph.setTheme(nextTheme);
        this.renderer?.render();
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }

    scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// ===== DEMO GRAPH RENDERERS FOR TYPE CARDS =====
function renderGraphTypeDemo(canvasId, type) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    ctx.clearRect(0, 0, width, height);
    
    const nodeRadius = 15;
    const nodes = [
        { x: 50, y: 50, label: 'A' },
        { x: 150, y: 50, label: 'B' },
        { x: 200, y: 100, label: 'C' },
        { x: 100, y: 120, label: 'D' }
    ];
    
    // Draw edges based on type
    ctx.strokeStyle = '#64ffda';
    ctx.lineWidth = 2;
    
    if (type === 'undirected') {
        // Undirected edges
        const edges = [[0, 1], [1, 2], [2, 3], [3, 0]];
        edges.forEach(([from, to]) => {
            ctx.beginPath();
            ctx.moveTo(nodes[from].x, nodes[from].y);
            ctx.lineTo(nodes[to].x, nodes[to].y);
            ctx.stroke();
        });
    } else if (type === 'directed') {
        // Directed edges with arrows
        const edges = [[0, 1], [1, 2], [2, 3], [3, 0]];
        edges.forEach(([from, to]) => {
            drawArrow(ctx, nodes[from], nodes[to], nodeRadius);
        });
    } else if (type === 'weighted') {
        // Weighted edges
        const edges = [[0, 1, 5], [1, 2, 3], [2, 3, 7], [3, 0, 2]];
        edges.forEach(([from, to, weight]) => {
            ctx.beginPath();
            ctx.moveTo(nodes[from].x, nodes[from].y);
            ctx.lineTo(nodes[to].x, nodes[to].y);
            ctx.stroke();
            
            // Draw weight
            const midX = (nodes[from].x + nodes[to].x) / 2;
            const midY = (nodes[from].y + nodes[to].y) / 2;
            ctx.fillStyle = '#64ffda';
            ctx.font = '12px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(weight.toString(), midX, midY);
        });
    }
    
    // Draw nodes
    nodes.forEach(node => {
        const gradient = ctx.createRadialGradient(
            node.x, node.y, 0,
            node.x, node.y, nodeRadius
        );
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(1, '#764ba2');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(node.x, node.y, nodeRadius, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px Inter';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.label, node.x, node.y);
    });
}

function drawArrow(ctx, from, to, nodeRadius) {
    const angle = Math.atan2(to.y - from.y, to.x - from.x);
    
    const startX = from.x + Math.cos(angle) * nodeRadius;
    const startY = from.y + Math.sin(angle) * nodeRadius;
    const endX = to.x - Math.cos(angle) * nodeRadius;
    const endY = to.y - Math.sin(angle) * nodeRadius;
    
    // Draw line
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    
    // Draw arrowhead
    const headLength = 10;
    const headAngle = Math.PI / 6;
    
    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(
        endX - headLength * Math.cos(angle - headAngle),
        endY - headLength * Math.sin(angle - headAngle)
    );
    ctx.moveTo(endX, endY);
    ctx.lineTo(
        endX - headLength * Math.cos(angle + headAngle),
        endY - headLength * Math.sin(angle + headAngle)
    );
    ctx.stroke();
}

// ===== INITIALIZE APPLICATION =====
let app;

document.addEventListener('DOMContentLoaded', function() {
    // Initialize AOS (Animate On Scroll)
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            easing: 'ease-in-out',
            once: true
        });
    }
    
    // Initialize main application
    app = new GraphApp();
    
    // Render demo graphs
    setTimeout(() => {
        renderGraphTypeDemo('undirected-demo', 'undirected');
        renderGraphTypeDemo('directed-demo', 'directed');
        renderGraphTypeDemo('weighted-demo', 'weighted');
    }, 100);
    
    // Initialize code highlighting
    if (typeof Prism !== 'undefined') {
        Prism.highlightAll();
    }
    
    console.log('🚀 Modern Graph Theory Application Initialized!');
});

// Sample graph setup
const sampleGraph = new Graph();
['A', 'B', 'C', 'D', 'E'].forEach(vertex => sampleGraph.addVertex(vertex));
sampleGraph.addEdge('A', 'B');
sampleGraph.addEdge('A', 'C');
sampleGraph.addEdge('B', 'D');
sampleGraph.addEdge('C', 'E');
sampleGraph.addEdge('D', 'E');

// Canvas drawing functions
const canvas = document.getElementById('graphCanvas');
const ctx = canvas.getContext('2d');

// Graph visualization data
const nodes = {
    'A': { x: 100, y: 80, color: '#3498db' },
    'B': { x: 200, y: 50, color: '#3498db' },
    'C': { x: 200, y: 110, color: '#3498db' },
    'D': { x: 300, y: 50, color: '#3498db' },
    'E': { x: 300, y: 110, color: '#3498db' }
};

const edges = [
    ['A', 'B'], ['A', 'C'], ['B', 'D'], ['C', 'E'], ['D', 'E']
];

let animationInProgress = false;
let currentStep = 0;

// Drawing functions
function drawGraph() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw edges
    ctx.strokeStyle = '#bdc3c7';
    ctx.lineWidth = 2;
    edges.forEach(([node1, node2]) => {
        const start = nodes[node1];
        const end = nodes[node2];
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
    });
    
    // Draw nodes
    Object.entries(nodes).forEach(([name, node]) => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, 20, 0, 2 * Math.PI);
        ctx.fillStyle = node.color;
        ctx.fill();
        ctx.strokeStyle = '#2c3e50';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw node label
        ctx.fillStyle = 'white';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(name, node.x, node.y);
    });
}

function highlightNode(nodeName, color = '#e74c3c') {
    nodes[nodeName].color = color;
    drawGraph();
}

function resetGraph() {
    Object.keys(nodes).forEach(node => {
        nodes[node].color = '#3498db';
    });
    drawGraph();
    document.getElementById('traversalResult').innerHTML = '';
    document.getElementById('stepByStep').innerHTML = '';
    animationInProgress = false;
    currentStep = 0;
}

async function animateTraversal(result, steps, algorithmName) {
    if (animationInProgress) return;
    
    animationInProgress = true;
    resetGraph();
    
    document.getElementById('traversalResult').innerHTML = 
        `<strong>${algorithmName} Traversal:</strong> <span class="loading"></span>`;
    
    const stepDiv = document.getElementById('stepByStep');
    stepDiv.innerHTML = '<strong>Các bước thực hiện:</strong><br>';
    
    // Animate each step
    for (let i = 0; i < result.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const node = result[i];
        highlightNode(node, '#27ae60');
        
        // Update result display
        const currentResult = result.slice(0, i + 1).join(' → ');
        document.getElementById('traversalResult').innerHTML = 
            `<strong>${algorithmName} Traversal:</strong> ${currentResult}`;
        
        // Add step explanation
        if (steps[i]) {
            stepDiv.innerHTML += `<div style="margin: 5px 0; padding: 5px; background: #ecf0f1; border-radius: 3px;">${i + 1}. ${steps[i]}</div>`;
        }
    }
    
    animationInProgress = false;
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    drawGraph();
    
    document.getElementById('dfsBtn').addEventListener('click', async function() {
        if (animationInProgress) return;
        
        const startNode = document.getElementById('startNode').value;
        const { result, steps } = sampleGraph.dfs(startNode);
        await animateTraversal(result, steps, 'DFS');
    });
    
    document.getElementById('bfsBtn').addEventListener('click', async function() {
        if (animationInProgress) return;
        
        const startNode = document.getElementById('startNode').value;
        const { result, steps } = sampleGraph.bfs(startNode);
        await animateTraversal(result, steps, 'BFS');
    });
    
    document.getElementById('resetBtn').addEventListener('click', resetGraph);
    
    // Smooth scrolling for navigation
    document.querySelectorAll('nav a').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

// Additional helper functions for demonstrations
function demonstrateDFS() {
    console.log("=== DFS Demonstration ===");
    const graph = {
        'A': ['B', 'C'],
        'B': ['A', 'D'],
        'C': ['A', 'E'],
        'D': ['B', 'E'],
        'E': ['C', 'D']
    };
    
    function dfsRecursive(graph, start, visited = new Set()) {
        visited.add(start);
        console.log(`Visited: ${start}`);
        
        for (let neighbor of graph[start]) {
            if (!visited.has(neighbor)) {
                dfsRecursive(graph, neighbor, visited);
            }
        }
        return visited;
    }
    
    function dfsIterative(graph, start) {
        const visited = new Set();
        const stack = [start];
        
        while (stack.length > 0) {
            const vertex = stack.pop();
            
            if (!visited.has(vertex)) {
                visited.add(vertex);
                console.log(`Visited: ${vertex}`);
                
                // Add neighbors to stack in reverse order to maintain left-to-right traversal
                for (let i = graph[vertex].length - 1; i >= 0; i--) {
                    const neighbor = graph[vertex][i];
                    if (!visited.has(neighbor)) {
                        stack.push(neighbor);
                    }
                }
            }
        }
        return visited;
    }
    
    console.log("DFS Recursive:");
    dfsRecursive(graph, 'A');
    
    console.log("\nDFS Iterative:");
    dfsIterative(graph, 'A');
}

function demonstrateBFS() {
    console.log("\n=== BFS Demonstration ===");
    const graph = {
        'A': ['B', 'C'],
        'B': ['A', 'D'],
        'C': ['A', 'E'],
        'D': ['B', 'E'],
        'E': ['C', 'D']
    };
    
    function bfs(graph, start) {
        const visited = new Set();
        const queue = [start];
        const result = [];
        
        visited.add(start);
        
        while (queue.length > 0) {
            const vertex = queue.shift();
            result.push(vertex);
            console.log(`Visited: ${vertex}`);
            
            for (let neighbor of graph[vertex]) {
                if (!visited.has(neighbor)) {
                    visited.add(neighbor);
                    queue.push(neighbor);
                }
            }
        }
        return result;
    }
    
    bfs(graph, 'A');
}

// Advanced algorithms for educational purposes
function findShortestPath(graph, start, end) {
    const queue = [[start]];
    const visited = new Set();
    
    while (queue.length > 0) {
        const path = queue.shift();
        const vertex = path[path.length - 1];
        
        if (vertex === end) {
            return path;
        }
        
        if (!visited.has(vertex)) {
            visited.add(vertex);
            
            for (let neighbor of graph.adjacencyList[vertex]) {
                if (!visited.has(neighbor)) {
                    queue.push([...path, neighbor]);
                }
            }
        }
    }
    
    return null; // No path found
}

function detectCycle(graph) {
    const visited = new Set();
    const recursionStack = new Set();
    
    function hasCycleDFS(vertex) {
        visited.add(vertex);
        recursionStack.add(vertex);
        
        for (let neighbor of graph.adjacencyList[vertex]) {
            if (!visited.has(neighbor)) {
                if (hasCycleDFS(neighbor)) {
                    return true;
                }
            } else if (recursionStack.has(neighbor)) {
                return true;
            }
        }
        
        recursionStack.delete(vertex);
        return false;
    }
    
    for (let vertex in graph.adjacencyList) {
        if (!visited.has(vertex)) {
            if (hasCycleDFS(vertex)) {
                return true;
            }
        }
    }
    
    return false;
}

// Example usage of advanced algorithms
console.log("=== Advanced Graph Algorithms ===");

// Shortest path example
console.log("Shortest path from A to E:", findShortestPath(sampleGraph, 'A', 'E'));

// Cycle detection
console.log("Does the graph have a cycle?", detectCycle(sampleGraph));

// Run demonstrations
demonstrateDFS();
demonstrateBFS();

// Additional interactive features
function addInteractiveFeatures() {
    // Add click handlers for nodes
    canvas.addEventListener('click', function(event) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // Check if click is on a node
        for (let [nodeName, node] of Object.entries(nodes)) {
            const distance = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2);
            if (distance <= 20) {
                // Update start node selection
                document.getElementById('startNode').value = nodeName;
                
                // Visual feedback
                resetGraph();
                highlightNode(nodeName, '#f39c12');
                
                console.log(`Selected node: ${nodeName}`);
                break;
            }
        }
    });
    
    // Add hover effects
    canvas.addEventListener('mousemove', function(event) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        let hoveringNode = false;
        for (let [, node] of Object.entries(nodes)) {
            const distance = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2);
            if (distance <= 20) {
                canvas.style.cursor = 'pointer';
                hoveringNode = true;
                break;
            }
        }
        
        if (!hoveringNode) {
            canvas.style.cursor = 'default';
        }
    });
}

// Initialize interactive features
addInteractiveFeatures();
