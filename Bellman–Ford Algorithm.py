import tkinter as tk  # นำเข้าโมดูล tkinter สำหรับสร้าง GUI
from tkinter import messagebox  # นำเข้า messagebox สำหรับการแสดงข้อความแจ้งเตือน

import networkx as nx  # นำเข้า NetworkX สำหรับการสร้างและจัดการกราฟ


class GraphSetup:
    @staticmethod
    def create_graph():
        # สร้างกราฟแบบมีทิศทาง
        graph = nx.DiGraph()

        # เพิ่มเส้นเชื่อม (edges) ด้วยน้ำหนัก (weights) ด้วยตนเอง
        # ตัวอย่าง: graph.add_edge('a', 'b', weight=100)
        graph.add_edge('A', 'B', weight=-1)
        graph.add_edge('A', 'C', weight=4)
        graph.add_edge('B', 'C', weight=3)
        graph.add_edge('B', 'D', weight=2)
        graph.add_edge('B', 'E', weight=2)
        graph.add_edge('D', 'B', weight=1)
        graph.add_edge('D', 'C', weight=5)
        graph.add_edge('E', 'D', weight=-3)

        # สามารถเพิ่มเส้นเชื่อมเพิ่มเติมได้ตามต้องการ
        # graph.add_edge('X', 'Y', weight=10)

        return graph  # ส่งคืนกราฟที่สร้างขึ้น

    @staticmethod
    def create_positions():
        # กำหนดตำแหน่งสำหรับแต่ละโหนดเพื่อใช้ในการแสดงผล
        positions = {
            'A': (100, 100),
            'B': (200, 200),
            'C': (400, 100),
            'D': (300, 300),
            'E': (500, 300)
            # สามารถเพิ่มตำแหน่งสำหรับโหนดเพิ่มเติมที่นี่ได้
            # 'X': (600, 200),
            # 'Y': (700, 100)
        }
        return positions  # ส่งคืนตำแหน่งโหนด


class BellmanFordGUI:
    def __init__(self, master, graph, positions):
        self.master = master  # เก็บออบเจ็กต์หลักของ GUI
        self.master.title("Bellman-Ford Algorithm Visualization")  # ตั้งชื่อหน้าต่าง GUI

        self.canvas = tk.Canvas(master, width=800, height=600, bg="white")  # สร้างพื้นที่สำหรับวาดกราฟ
        self.canvas.pack()  # แสดง Canvas ในหน้าต่าง

        self.controls = tk.Frame(master)  # สร้างเฟรมสำหรับปุ่มควบคุม
        self.controls.pack()  # แสดงเฟรมควบคุม

        self.source_label = tk.Label(self.controls, text="Select Source:")  # สร้างป้ายชื่อสำหรับเลือกโหนดต้นทาง
        self.source_label.pack(side=tk.LEFT, padx=5)  # แสดงป้ายชื่อทางด้านซ้าย

        self.source_var = tk.StringVar(master)  # สร้างตัวแปรสำหรับเก็บค่าตัวเลือกโหนดต้นทาง
        self.source_var.set(list(graph.nodes)[0])  # กำหนดค่าเริ่มต้นเป็นโหนดแรกในกราฟ
        self.source_menu = tk.OptionMenu(self.controls, self.source_var, *graph.nodes)  # สร้างเมนูดรอปดาวน์สำหรับเลือกโหนดต้นทาง
        self.source_menu.pack(side=tk.LEFT, padx=5)  # แสดงเมนูทางด้านซ้าย

        self.run_button = tk.Button(self.controls, text="Run Bellman-Ford", command=self.run_bellman_ford)  # สร้างปุ่มสำหรับรันอัลกอริทึม Bellman-Ford
        self.run_button.pack(side=tk.LEFT, padx=5)  # แสดงปุ่มทางด้านซ้าย

        self.graph = graph  # เก็บกราฟที่สร้างขึ้น
        self.positions = positions  # เก็บตำแหน่งโหนด

        self.draw_graph()  # เรียกใช้เมธอดเพื่อวาดกราฟ

    def draw_graph(self, highlight_path=None):
        self.canvas.delete("all")  # ล้าง Canvas ก่อนวาดใหม่
        offset_distance = 10  # Distance to offset parallel edges

        # วาดเส้นเชื่อม (edges)
        for u, v, data in self.graph.edges(data=True):
            x1, y1 = self.positions[u]  # รับพิกัดโหนดต้นทาง
            x2, y2 = self.positions[v]  # รับพิกัดโหนดปลายทาง

            # คำนวณเวกเตอร์ทิศทาง
            dx, dy = x2 - x1, y2 - y1
            length = (dx**2 + dy**2)**0.5

            # ปรับเวกเตอร์ทิศทางให้มีความยาวตามที่ต้องการ
            arrow_length = 20
            x2 = x2 - (dx / length) * arrow_length
            y2 = y2 - (dy / length) * arrow_length

            # คำนวณการเลื่อนในแนวตั้งฉาก
            offset_x = -dy / length * offset_distance
            offset_y = dx / length * offset_distance

            # ใช้การเลื่อนกับเส้นเชื่อม
            if (v, u) in self.graph.edges:
                x1 += offset_x
                y1 += offset_y
                x2 += offset_x
                y2 += offset_y
            else:
                x1 -= offset_x
                y1 -= offset_y
                x2 -= offset_x
                y2 -= offset_y

            if highlight_path and (u, v) in highlight_path:
                # วาดเส้นเชื่อมที่ถูกเน้นด้วยสีแดง
                self.canvas.create_line(x1, y1, x2, y2, arrow=tk.LAST, width=3, fill="red")
            else:
                # วาดเส้นเชื่อมปกติ
                self.canvas.create_line(x1, y1, x2, y2, arrow=tk.LAST, width=2)
            # แสดงน้ำหนักของเส้นเชื่อม
            mid_x, mid_y = (x1 + x2) / 2, (y1 + y2) / 2  # คำนวณตำแหน่งกึ่งกลางของเส้นเชื่อม
            self.canvas.create_text(mid_x, mid_y, text=str(data['weight']), fill="blue")  # แสดงน้ำหนักที่ตำแหน่งกึ่งกลาง

        # วาดโหนด (nodes)
        for node in self.graph.nodes:
            x, y = self.positions[node]  # รับพิกัดโหนด
            self.canvas.create_oval(x-20, y-20, x+20, y+20, fill="lightblue")  # วาดวงกลมแทนโหนด
            self.canvas.create_text(x, y, text=node, font=("Arial", 12, "bold"))  # แสดงชื่อโหนดภายในวงกลม

    def run_bellman_ford(self):
        source = self.source_var.get()  # ดึงค่าโหนดต้นทางที่เลือกจากเมนู
        try:
            distances, predecessors = self.bellman_ford(source)  # รันอัลกอริทึม Bellman-Ford
            message = f"Shortest distances from {source}:\n"  # เริ่มต้นข้อความแสดงผลลัพธ์
            for vertex, distance in distances.items():
                message += f"{vertex}: {distance}\n"  # เพิ่มระยะทางสั้นสุดของแต่ละโหนด
            messagebox.showinfo("Bellman-Ford Result", message)  # แสดงผลลัพธ์ในกล่องข้อความ
            # เน้นทางเดินที่สั้นที่สุด
            self.highlight_paths(source, predecessors)
        except ValueError as e:
            messagebox.showerror("Error", str(e))  # แสดงข้อความแสดงข้อผิดพลาดถ้ามี

    def highlight_paths(self, source, predecessors):
        paths = []  # เก็บเส้นทางที่ต้องการเน้น
        for vertex in self.graph.nodes:
            if vertex == source:
                continue  # ข้ามโหนดต้นทาง
            path = []  # ลิสต์สำหรับเส้นทางของโหนดปัจจุบัน
            current = vertex  # ตั้งโหนดปัจจุบัน
            while current != source and current in predecessors:
                prev = predecessors[current]  # รับโหนดก่อนหน้าของโหนดปัจจุบัน
                path.append((prev, current))  # เพิ่มเส้นเชื่อมลงในเส้นทาง
                current = prev  # เลื่อนไปยังโหนดก่อนหน้า
            if current == source:
                paths.extend(path)  # เพิ่มเส้นทางที่ครบถ้วนลงในลิสต์เส้นทางทั้งหมด
        self.draw_graph(highlight_path=paths)  # วาดกราฟพร้อมเน้นเส้นทางที่เลือก

    def bellman_ford(self, source):
        distance = {vertex: float('inf') for vertex in self.graph.nodes}  # กำหนดระยะทางเริ่มต้นเป็นอนันต์สำหรับทุกโหนด
        predecessor = {}  # กำหนดพรีดีเซสเซอร์สำหรับเส้นทาง
        distance[source] = 0  # กำหนดระยะทางของโหนดต้นทางเป็น 0

        # ทำการผ่อนคลายเส้นเชื่อมทั้งหมด |V| - 1 ครั้ง
        for _ in range(len(self.graph.nodes) - 1):
            for u, v, data in self.graph.edges(data=True):
                # พิมพ์ข้อมูลการทดลองผ่อนคลายเส้นเชื่อม
                # print(u, v, distance[u], distance[v], data['weight'])
                if distance[u] + data['weight'] < distance[v]:
                    distance[v] = distance[u] + data['weight']  # ปรับปรุงระยะทางสั้นสุด
                    predecessor[v] = u  # บันทึกพรีดีเซสเซอร์ของโหนด

        # ตรวจสอบว่ามีวงจรน้ำหนักลบหรือไม่
        for u, v, data in self.graph.edges(data=True):
            if distance[u] + data['weight'] < distance[v]:
                raise ValueError("Graph contains a negative-weight cycle")  # ยกข้อผิดพลาดถ้ามีวงจรน้ำหนักลบ

        return distance, predecessor  # ส่งคืนระยะทางและพรีดีเซสเซอร์


if __name__ == "__main__":
    # ตั้งค่าสร้างกราฟและตำแหน่งโหนด
    graph = GraphSetup.create_graph()  # สร้างกราฟโดยใช้เมธอดจากคลาส GraphSetup
    positions = GraphSetup.create_positions()  # กำหนดตำแหน่งโหนดสำหรับกราฟ

    # เริ่มต้น GUI
    root = tk.Tk()  # สร้างหน้าต่างหลักของ Tkinter
    app = BellmanFordGUI(root, graph, positions)  # สร้างอ็อบเจ็กต์ของ GUI พร้อมกราฟและตำแหน่งโหนด
    root.mainloop()  # รันลูปหลักของ GUI
